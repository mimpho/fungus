"""
End-to-end check of the corner photos against a RUNNING backend (the unit tests cannot reach the
SQL stores). Point it at a local server with a DISPOSABLE database and the DEV bucket:

    cd backend
    python -m scripts.qa_corner_photos /path/to/photo.heic [--base http://localhost:8001]

It registers (or logs in) a throw-away user, saves a corner, uploads the photo tagged with a
species, lists it, opens the signed URLs, checks that the corner counts it, deletes the photo and
the corner, and prints one line per step. Nothing in it needs a token pasted by hand.
"""
import argparse
import io
import sys

import httpx
from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()
EMAIL, PASSWORD = "prueba-fotos@example.com", "Prueba12345!"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("photo")
    parser.add_argument("--base", default="http://localhost:8001")
    parser.add_argument("--species", nargs="*", default=["esp-test-1", "esp-test-2"])
    args = parser.parse_args()
    api = f"{args.base.rstrip('/')}/api/v1"
    step = "start"
    with httpx.Client(timeout=60) as c:
        try:
            step = "register / login"
            body = {"email": EMAIL, "password": PASSWORD}
            names = {"first_name": "QA", "last_name": "Fotos"}
            r = c.post(f"{api}/auth/register", json={**body, **names})
            if r.status_code == 409:
                r = c.post(f"{api}/auth/login", json=body)
            r.raise_for_status()
            c.headers["Authorization"] = f"Bearer {r.json()['access_token']}"
            print("ok  user")

            step = "save corner"
            r = c.post(f"{api}/observatory/saved-points",
                       json={"lat": 41.77, "lon": 2.43, "name": "QA fotos",
                             "species_ids": args.species[:1]})
            if r.status_code == 409:  # a previous run left it: start from a clean one
                old = [p for p in c.get(f"{api}/observatory/saved-points").json()
                       if (p["lat"], p["lon"]) == (41.77, 2.43)]
                c.delete(f"{api}/observatory/saved-points/{old[0]['id']}").raise_for_status()
                r = c.post(f"{api}/observatory/saved-points",
                           json={"lat": 41.77, "lon": 2.43, "name": "QA fotos",
                                 "species_ids": args.species[:1]})
            r.raise_for_status()
            point = r.json()["id"]
            print(f"ok  corner {point}")
            url = f"{api}/observatory/saved-points/{point}/photos"

            step = "upload"
            with open(args.photo, "rb") as f:
                r = c.post(url, files={"file": (args.photo.split("/")[-1], f)},
                           data={"species_ids": args.species[1:2]})
            r.raise_for_status()
            photo = r.json()
            print(f"ok  uploaded photo {photo['id']} position {photo['position']} "
                  f"species {photo['species_ids']}")

            step = "list + signed urls"
            listed = c.get(url).json()
            assert [p["id"] for p in listed] == [photo["id"]], listed
            for name in ("thumb_url", "large_url"):
                got = c.get(listed[0][name])
                got.raise_for_status()
                img = Image.open(io.BytesIO(got.content))
                exif = len(img.getexif())
                print(f"ok  {name}: {img.format} {img.size[0]}x{img.size[1]} "
                      f"{len(got.content) // 1024} KB, exif tags: {exif}")
                assert img.format == "WEBP" and exif == 0

            step = "corner counts the photo"
            corner = c.get(f"{api}/observatory/saved-points/{point}").json()
            assert corner["photo_count"] == 1, corner
            print(f"ok  photo_count 1, all_species_ids {corner['all_species_ids']}")

            step = "tag the photo again"
            r = c.patch(f"{url}/{photo['id']}", json={"species_ids": []})
            r.raise_for_status()
            assert r.json()["species_ids"] == []
            print("ok  photo species replaced")

            step = "delete photo"
            c.delete(f"{url}/{photo['id']}").raise_for_status()
            assert c.get(url).json() == []
            print("ok  photo deleted")

            step = "upload again and delete the corner (objects must go too)"
            with open(args.photo, "rb") as f:
                c.post(url, files={"file": ("again.jpg", f)}).raise_for_status()
            c.delete(f"{api}/observatory/saved-points/{point}").raise_for_status()
            print("ok  corner deleted. Check the bucket is empty in Supabase")
        except (httpx.HTTPError, AssertionError, KeyError, IndexError) as exc:
            detail = getattr(getattr(exc, "response", None), "text", "")
            print(f"FAIL at '{step}': {exc} {detail}")
            return 1
    print("All good")
    return 0


if __name__ == "__main__":
    sys.exit(main())
