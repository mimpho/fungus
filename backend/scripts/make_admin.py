import asyncio
from sqlalchemy import text
from app.database import engine
from app.config import settings

async def make_admin(email: str):
    print(f"Buscando usuario {email} en {settings.database_url.split('@')[-1]}...")
    async with engine.begin() as conn:
        # Primero ver si la columna existe (safety check)
        check_col = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='role'"
        ))
        if not check_col.scalar():
            print("ERROR: La columna 'role' no existe en la tabla 'users'.")
            return

        result = await conn.execute(
            text("UPDATE users SET role = 'admin' WHERE email = :email RETURNING id, email, role"),
            {"email": email}
        )
        user = result.fetchone()
        if user:
            print(f"¡ÉXITO! Usuario {user.email} (id={user.id}) ahora tiene el rol: {user.role}")
        else:
            print(f"ERROR: No se encontró ningún usuario con el email: {email}")

if __name__ == "__main__":
    email = "mimpho@gmail.com"
    asyncio.run(make_admin(email))
