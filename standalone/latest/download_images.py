#!/usr/bin/env python3
"""
Descarga imágenes de iNaturalist para todas las especies del catálogo Fungus.
Guarda cada imagen en medium (500px) y large (1024px):
  esp-XXX-main.jpg, esp-XXX-main-large.jpg, esp-XXX-foto1.jpg, esp-XXX-foto1-large.jpg, etc.
Re-optimiza JPEG: medium 82, large 75 (sin EXIF).

USO:
    cd standalone/latest
    pip install requests Pillow   (si no lo tienes)
    python3 download_images.py

    # Descargar 3 fotos por especie (por defecto):
    python3 download_images.py

    # Descargar solo 1 foto (comportamiento antiguo):
    python3 download_images.py --photos 1

    # Forzar re-descarga de todas:
    python3 download_images.py --force

    # Probar solo con las primeras N especies:
    python3 download_images.py --limit 10

    # Sin optimización (guardar tal cual):
    python3 download_images.py --no-optimize
"""

import json
import os
import re
import sys
import time
import argparse
from typing import Optional
import requests

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

SPECIES_FILE  = "species_list.json"
OUTPUT_DIR    = "assets/images"
API_BASE      = "https://api.inaturalist.org/v1"
DELAY_OK      = 0.6   # segundos entre requests exitosos
DELAY_ERR     = 1.0   # segundos tras un error
MAX_RETRIES   = 3
PHOTO_SIZE    = "medium"   # square | small | medium | large | original
DEFAULT_PHOTOS = 3
JPEG_QUALITY_MEDIUM = 82   # cards, listas — alta calidad
JPEG_QUALITY_LARGE  = 75   # modal/lightbox — menor peso, aceptable para 1024px


def _extract_photo_url(taxon: dict) -> Optional[str]:
    """Extrae la URL de foto de un objeto taxon de iNaturalist."""
    default_photo = taxon.get("default_photo")
    if not default_photo:
        return None
    return default_photo.get(f"{PHOTO_SIZE}_url") or default_photo.get("medium_url")


def _api_get(path: str, params: dict) -> list:
    """Hace GET a la API y devuelve results, o [] si falla."""
    try:
        r = requests.get(f"{API_BASE}{path}", params=params, timeout=10)
        r.raise_for_status()
        return r.json().get("results", [])
    except Exception as e:
        print(f"    ⚠ Error API: {e}")
        return []


def _get_taxon_id(scientific_name: str) -> Optional[int]:
    """Obtiene el taxon_id de iNaturalist para una especie."""
    genus = scientific_name.split()[0].lower()
    strategies = [
        {"taxon_name": scientific_name, "per_page": 1, "locale": "es"},
        {"q": scientific_name, "per_page": 3, "locale": "es"},
        {"taxon_name": " ".join(scientific_name.split()[:2]), "per_page": 1, "locale": "es"},
    ]
    for params in strategies:
        results = _api_get("/taxa", params)
        for taxon in results:
            taxon_name = taxon.get("name", "").lower()
            if taxon_name.startswith(genus):
                tid = taxon.get("id")
                if tid:
                    return tid
    return None


def get_taxon_photo_url(scientific_name: str) -> Optional[str]:
    """
    Busca la foto en iNaturalist con estrategia en cascada:
      1. taxon_name exacto  (sin filtro de rango — cubre subsp., var., sinónimos)
      2. q fuzzy  sin rank  (más tolerante)
      3. q fuzzy  con rank=species (último recurso)
    Valida siempre que el género coincida.
    """
    genus = scientific_name.split()[0].lower()

    strategies = [
        # 1. Búsqueda exacta por nombre científico — la más precisa
        {"taxon_name": scientific_name, "per_page": 1, "locale": "es"},
        # 2. Búsqueda fuzzy sin restricción de rango
        {"q": scientific_name, "per_page": 3, "locale": "es"},
        # 3. Solo el binomio (quita variedad/subespecie si la hay)
        {"taxon_name": " ".join(scientific_name.split()[:2]), "per_page": 1, "locale": "es"},
    ]

    for params in strategies:
        results = _api_get("/taxa", params)
        for taxon in results:
            taxon_name = taxon.get("name", "").lower()
            # Aceptar si el género coincide (tolera sinónimos y variantes infraespecíficas)
            if not taxon_name.startswith(genus):
                continue
            url = _extract_photo_url(taxon)
            if url:
                return url

    return None


def get_professional_taxon_photos(scientific_name: str, max_photos: int = 5) -> list[str]:
    taxon_id = _get_taxon_id(scientific_name)
    if not taxon_id:
        return []

    urls = []
    seen = set()

    # ESTRATEGIA A: Obtener las fotos "curadas" del Taxón (las de la web)
    try:
        r = requests.get(f"{API_BASE}/taxa/{taxon_id}", timeout=10)
        r.raise_for_status()
        taxon_data = r.json().get("results", [{}])[0]
        
        # Estas son las fotos que ves en la cabecera de la web
        for tp in taxon_data.get("taxon_photos", []):
            photo = tp.get("photo", {})
            url = _prepare_high_res_url(photo)
            if url and url not in seen:
                urls.append(url)
                seen.add(url)
                
        if len(urls) >= max_photos:
            return urls[:max_photos]
    except Exception as e:
        print(f"Error obteniendo taxon_photos: {e}")

    # ESTRATEGIA B: Buscar observaciones con muchos "FAVES" (estética)
    try:
        params = {
            "taxon_id": taxon_id,
            "quality_grade": "research", # Solo grado de investigación
            "popular": "true",           # <--- CRUCIAL: Filtra por fotos con likes
            "order_by": "faves",         # <--- Ordena por favoritos, no por votos
            "per_page": 10
        }
        r = requests.get(f"{API_BASE}/observations", params=params, timeout=10)
        # ... procesar igual que en tu código anterior ...
    except Exception as e:
        print(f"Error en búsqueda por faves: {e}")

    return urls[:max_photos]

def _prepare_high_res_url(photo_dict):
    """Auxiliar para forzar la máxima calidad disponible"""
    # iNaturalist ofrece: square, small, medium, large, original
    for size in ["large", "medium"]: 
        url = photo_dict.get(f"{size}_url")
        if url: return url
    return photo_dict.get("url")


def get_professional_taxon_photos(scientific_name: str, max_photos: int = 5) -> list[str]:
    """
    Obtiene URLs de alta calidad combinando fotos oficiales del taxón y observaciones populares.
    Devuelve URLs en formato 'medium' para que sean la base de la descarga.
    """
    taxon_id = _get_taxon_id(scientific_name)
    if not taxon_id:
        return []

    urls = []
    seen_ids = set() # Usamos el ID de la foto para evitar duplicados reales

    # --- PASO 1: FOTOS OFICIALES (Taxon Photos) ---
    try:
        r = requests.get(f"{API_BASE}/taxa/{taxon_id}", timeout=10)
        r.raise_for_status()
        taxon_data = r.json().get("results", [{}])[0]
        
        for tp in taxon_data.get("taxon_photos", []):
            photo = tp.get("photo", {})
            p_id = photo.get("id")
            # Usamos tu función _url_for_size para estandarizar a medium
            url_base = _url_for_size(photo.get("url"), "medium")
            
            if url_base and p_id not in seen_ids:
                urls.append(url_base)
                seen_ids.add(p_id)
                
        if len(urls) >= max_photos:
            return urls[:max_photos]
            
    except Exception as e:
        print(f"⚠️ Error en taxon_photos: {e}")

    # --- PASO 2: FOTOS POPULARES (Observations con Faves) ---
    # Si aún faltan fotos, buscamos las que tienen más "likes" de la comunidad
    try:
        params = {
            "taxon_id": taxon_id,
            "quality_grade": "research",
            "popular": "true",    # Filtro de estética (fotos con favoritos)
            "order_by": "faves",  # Ordenar por likes
            "per_page": 10
        }
        r = requests.get(f"{API_BASE}/observations", params=params, timeout=10)
        r.raise_for_status()
        observations = r.json().get("results", [])

        for obs in observations:
            for op in obs.get("observation_photos", []):
                photo = op.get("photo", {})
                p_id = photo.get("id")
                url_base = _url_for_size(photo.get("url"), "medium")
                
                if url_base and p_id not in seen_ids:
                    urls.append(url_base)
                    seen_ids.add(p_id)
                    if len(urls) >= max_photos:
                        return urls[:max_photos]
                        
    except Exception as e:
        print(f"⚠️ Error en búsqueda popular: {e}")

    return urls[:max_photos]


def _url_for_size(url: str, target_size: str) -> str:
    """Obtiene la URL para otro tamaño (medium, large, original...)."""
    return re.sub(
        r"/(square|small|medium|large|original)(\.[a-z]+)$",
        f"/{target_size}\\2",
        url,
        flags=re.IGNORECASE,
    )


def _optimize_jpeg(path: str, quality: int = JPEG_QUALITY_MEDIUM) -> bool:
    """Re-codifica JPEG con calidad dada y sin EXIF. Devuelve True si OK."""
    if not HAS_PIL:
        return True
    try:
        with Image.open(path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(
                path,
                "JPEG",
                quality=quality,
                optimize=True,
                progressive=True,
            )
        return True
    except Exception as e:
        print(f"    ⚠ Optimización fallida: {e}")
        return False


def download_image(url: str, dest_path: str, optimize: bool = True, quality: int = JPEG_QUALITY_MEDIUM) -> bool:
    """Descarga la imagen de url a dest_path. Si optimize, re-codifica JPEG. Devuelve True si OK."""
    try:
        r = requests.get(url, timeout=20, stream=True)
        r.raise_for_status()
        with open(dest_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        if optimize and HAS_PIL and dest_path.lower().endswith((".jpg", ".jpeg")):
            _optimize_jpeg(dest_path, quality=quality)
        size_kb = os.path.getsize(dest_path) // 1024
        print(f"    ✓ {size_kb} KB → {os.path.basename(dest_path)}")
        return True
    except Exception as e:
        print(f"    ✗ Error descarga: {e}")
        if os.path.exists(dest_path):
            os.remove(dest_path)
        return False


def _photo_filename(sp_id: str, index: int, large: bool = False) -> str:
    """esp-001, 0, False -> main; esp-001, 0, True -> main-large; etc."""
    base = f"{sp_id}-main" if index == 0 else f"{sp_id}-foto{index}"
    suffix = "-large" if large else ""
    return f"{base}{suffix}.jpg"


def main():
    parser = argparse.ArgumentParser(description="Descarga imágenes de iNaturalist")
    parser.add_argument("--force",        action="store_true", help="Re-descargar aunque ya exista el archivo")
    parser.add_argument("--limit",        type=int, default=0, help="Limitar a las primeras N especies")
    parser.add_argument("--photos",       type=int, default=DEFAULT_PHOTOS, help=f"Fotos por especie (default: {DEFAULT_PHOTOS})")
    parser.add_argument("--no-optimize",  action="store_true", help="No re-optimizar JPEG (guardar tal cual)")
    parser.add_argument("--retry-failed", action="store_true", help="Reintentar solo las que fallaron (download_not_found.txt)")
    args = parser.parse_args()

    # Cargar lista de especies
    if not os.path.exists(SPECIES_FILE):
        print(f"ERROR: No se encuentra {SPECIES_FILE}. Ejecútalo desde standalone/latest/")
        sys.exit(1)

    with open(SPECIES_FILE) as f:
        species_list = json.load(f)

    # Filtrar solo las que fallaron en la pasada anterior
    if args.retry_failed:
        nf_file = "download_not_found.txt"
        if not os.path.exists(nf_file):
            print(f"No se encuentra {nf_file}. Ejecuta primero sin --retry-failed.")
            sys.exit(1)
        with open(nf_file) as f:
            failed_ids = {line.split()[0] for line in f if line.strip()}
        species_list = [s for s in species_list if s["id"] in failed_ids]
        print(f"Reintentando {len(species_list)} especies fallidas con búsqueda mejorada…")

    if args.limit:
        species_list = species_list[:args.limit]

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    total     = len(species_list)
    ok        = 0
    skipped   = 0
    not_found = 0
    errors    = 0
    not_found_list = []

    optimize = not args.no_optimize
    print(f"\n🍄 Fungus Image Downloader")
    print(f"   Especies: {total} | Fotos/especie: {args.photos} (medium + large cada una) | Output: {OUTPUT_DIR}/")
    print(f"   Forzar re-descarga: {'sí' if args.force else 'no'}")
    if optimize and HAS_PIL:
        print(f"   Optimización JPEG: medium={JPEG_QUALITY_MEDIUM}, large={JPEG_QUALITY_LARGE} (sin EXIF)")
    elif optimize and not HAS_PIL:
        print(f"   ⚠ Pillow no instalado — imágenes sin optimizar. Ejecuta: pip install Pillow")
    else:
        print(f"   Optimización: desactivada")
    print()

    for i, sp in enumerate(species_list, 1):
        sp_id   = sp["id"]
        sp_name = sp["name"]

        # Archivos esperados: main + main-large, foto1 + foto1-large, ...
        expected = []
        for j in range(args.photos):
            expected.append(os.path.join(OUTPUT_DIR, _photo_filename(sp_id, j)))
            expected.append(os.path.join(OUTPUT_DIR, _photo_filename(sp_id, j, large=True)))
        all_exist = all(os.path.exists(p) for p in expected)

        print(f"[{i:3}/{total}] {sp_name} ({sp_id})")

        if all_exist and not args.force:
            print(f"    → ya existen {args.photos} fotos (medium + large), saltar")
            skipped += 1
            continue

        # Buscar fotos en iNaturalist (con reintentos)
        urls: list[str] = []
        for attempt in range(1, MAX_RETRIES + 1):
            # urls = get_taxon_photo_urls(sp_name, max_photos=args.photos)
            urls = get_professional_taxon_photos(sp_name, max_photos=args.photos)
            if urls:
                break
            if attempt < MAX_RETRIES:
                print(f"    ↻ Reintento {attempt}/{MAX_RETRIES - 1}…")
                time.sleep(DELAY_ERR)

        if not urls:
            print(f"    ✗ Sin foto en iNaturalist")
            not_found += 1
            not_found_list.append(f"{sp_id} {sp_name}")
            time.sleep(DELAY_ERR)
            continue

        # Descargar cada foto en medium y large
        for idx, url in enumerate(urls):
            # Medium (URL ya es medium)
            dest_med = os.path.join(OUTPUT_DIR, _photo_filename(sp_id, idx))
            if not (os.path.exists(dest_med) and not args.force):
                if download_image(url, dest_med, optimize=optimize):
                    ok += 1
                    time.sleep(DELAY_OK)
                else:
                    errors += 1
                    time.sleep(DELAY_ERR)
            # Large (derivamos la URL, compresión más agresiva)
            dest_lrg = os.path.join(OUTPUT_DIR, _photo_filename(sp_id, idx, large=True))
            if not (os.path.exists(dest_lrg) and not args.force):
                url_large = _url_for_size(url, "large")
                if download_image(url_large, dest_lrg, optimize=optimize, quality=JPEG_QUALITY_LARGE):
                    ok += 1
                    time.sleep(DELAY_OK)
                else:
                    errors += 1
                    time.sleep(DELAY_ERR)

    # Resumen
    print(f"\n{'─'*50}")
    print(f"✅ Descargadas:    {ok}")
    print(f"⏭  Ya existían:   {skipped}")
    print(f"✗  Sin foto:      {not_found}")
    print(f"⚠  Errores:       {errors}")
    print(f"{'─'*50}")

    if not_found_list:
        log_path = "download_not_found.txt"
        with open(log_path, "w") as f:
            f.write("\n".join(not_found_list))
        print(f"\nEspecies sin foto guardadas en: {log_path}")

    print("\nListo. Recarga la app para ver las imágenes locales.")


if __name__ == "__main__":
    main()
