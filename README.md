# 🍄 Fungus

Sistema inteligente de predicción micológica para Cataluña y España.

## 📋 Versión Actual: v2.8.0

### 🎯 ¿Qué es Fungus?

Fungus es una aplicación web que predice las mejores zonas y momentos para la recolección de setas, combinando:
- Datos meteorológicos en tiempo real
- Análisis de condiciones del suelo
- Algoritmo de scoring inteligente
- Base de datos de especies micológicas

---

## 🚀 Inicio Rápido

### Opción 1: Standalone ⭐ Recomendada

Requiere un servidor HTTP local (Babel no puede cargar scripts externos con `file://`):

```bash
cd standalone/latest
python3 -m http.server 8080
# Abrir en el navegador: http://localhost:8080/index.html
```

O con Node.js:
```bash
cd standalone/latest
npx serve .
# Abrir: http://localhost:3000/index.html
```

✅ Sin instalación de dependencias
✅ Sin build step
✅ Funciona offline (excepto mapa Leaflet e imágenes externas)
✅ Todas las funcionalidades
⚠️ Requiere python3 o Node para servir los archivos localmente

### Opción 2: Frontend React (desarrollo)

```bash
cd frontend
npm install
npm start
```

---

## 📂 Estructura del Proyecto

```
fungus/
├── README.md
├── CHANGELOG.md
├── CLAUDE.md
│
├── docs/
│   ├── MEJORAS-CHANGELOG.md
│   ├── IMPLEMENTACION-COMPLETA.md
│   └── README-MOCK-DATA.md
│
├── frontend/                    # App React (CRA, secundario)
│   ├── package.json
│   └── src/
│
└── standalone/                  # Entregable principal
    ├── latest/                  ← Versión activa (v2.8.0)
    │   ├── index.html           ← Punto de entrada
    │   ├── styles.css
    │   ├── assets/images/       ← Fotos de especies (esp-XXX-main.jpg)
    │   ├── data/                ← Datos mock (i18n, zonas, especies...)
    │   └── components/          ← Componentes React (Babel JSX)
    └── archive/                 ← Versiones anteriores
```

---

## ✨ Características v2.8.0

### 🗺️ Zonas
- **28 zonas** en toda España (Pirineos, Sistema Central, Cantábrica, Mediterráneo)
- Mapa Leaflet interactivo con modo marcadores y mapa de calor
- Ficha de zona: termómetro, condiciones actuales, especies disponibles, calendario, mapa
- Seguimiento de zonas con persistencia en localStorage

### 🍄 Especies
- **27 especies** en catálogo con fotos reales
- Buscador, filtro por familia, ordenación, favoritos, paginación (8/página)
- Ficha: morfología técnica, galería de fotos, lightbox, mapa de distribución

### 🔬 Familias
- 8 familias micológicas con descripción y listado de especies

### 👤 Perfil
- Notificaciones de zonas seguidas
- Datos personales editables
- Idioma: Castellano / Català / English

### 🗺️ Dashboard inteligente
- Condiciones generales agregadas
- Mejor zona del día con explicación
- Especies activas este mes

---

## 🛠️ Tecnologías

- React 18 (via CDN unpkg)
- Tailwind CSS (via CDN)
- Leaflet.js 1.9.4 + leaflet.heat (mapas interactivos y mapa de calor)
- Babel Standalone (transpilación JSX en browser)
- LocalStorage API (persistencia)
- Google Fonts: Cormorant Garamond + DM Sans

---

## 📦 Versiones

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| v2.8.0 | 2026-02-18 | 28 zonas, 27 especies, cobertura toda España |
| v2.7.3 | 2026-02-18 | Dashboard inteligente, tabs en fullscreen |
| v2.3.0 | 2026-02-17 | Mobile bottom sheet, hero fotos, modales mejorados |
| v2.1.0 | 2026-02-17 | Mapa Leaflet, 25 especies, familias, perfil, i18n |
| v2.0.0 | 2026-02-17 | Seguimiento, modal 3 pestañas, termómetro |
| v1.0.0 | 2026-02-16 | Dashboard, zonas, especies, diseño base |

---

## 🗺️ Roadmap

### Próximo
- [ ] Backend FastAPI + APIs meteorológicas reales (Meteocat/AEMET)
- [ ] Zonas personalizadas por usuario en mapa
- [ ] Exportar calendario a PDF
- [ ] Imágenes de especie de calidad (reemplazar scaffolding actual)

### v3.0.0 (Futuro)
- [ ] Base de datos PostgreSQL
- [ ] Autenticación de usuarios
- [ ] App móvil (React Native)
- [ ] Fotografías comunitarias de avistamientos

---

## 📄 Licencia

Este proyecto es un prototipo de demostración.

**⭐ Si te gusta Fungus, dale una estrella!**
# fungus
