# FRONTEND MICOMAPA - DOCUMENTACIÓN COMPLETA

## 📱 Aplicación React para Predicción Micológica

---

## 🎨 DISEÑO Y ESTÉTICA

### Concepto Visual
**Orgánico-Científico**: Fusión entre naturaleza del bosque y precisión de datos

**Paleta de Colores:**
- `#1a3a2e` - Forest Dark (fondo principal)
- `#2d4a3e` - Forest Medium (degradados)
- `#8b6f47` - Earth Brown (acentos principales)
- `#4a7c59` - Moss Green (secundarios)
- `#f4ebe1` - Mushroom Cream (texto)
- `#059669` - Safe Green (éxito/seguro)
- `#d97706` - Warning Amber (precaución)
- `#dc2626` - Danger Red (peligro)

**Tipografía:**
- Display: `Newsreader` (serif elegante para títulos)
- Body: `Inter` (sans-serif moderna para texto)

**Efectos Visuales:**
- Glass morphism (fondos translúcidos con backdrop-filter)
- Animaciones suaves de entrada (fadeIn, slideIn)
- Hover states con scale y glow effects
- Score rings animados con SVG

---

## 🏗️ ESTRUCTURA DEL PROYECTO

```
frontend/
├── public/
│   └── index.html                 # HTML base
├── src/
│   ├── index.js                   # Entry point
│   ├── App.jsx                    # Componente principal
│   ├── components/                # (Futuro: componentes separados)
│   ├── services/                  # (Futuro: API calls)
│   └── utils/                     # (Futuro: helpers)
├── .env.example                   # Variables de entorno
├── package.json                   # Dependencias
└── README.md                      # Esta documentación
```

---

## 📦 INSTALACIÓN Y CONFIGURACIÓN

### Requisitos Previos
- Node.js 16+ y npm
- Backend de MicoMapa corriendo en http://localhost:8000

### Instalación

```bash
# 1. Navegar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env
cp .env.example .env

# 4. Editar .env con la URL de tu API
# REACT_APP_API_URL=http://localhost:8000

# 5. Iniciar servidor de desarrollo
npm start
```

La aplicación se abrirá en `http://localhost:3000`

### Build para Producción

```bash
# Crear build optimizado
npm run build

# Los archivos estarán en /build
# Servir con nginx, Apache, o cualquier servidor estático
```

---

## 🧩 COMPONENTES PRINCIPALES

### 1. **App.jsx**
Componente raíz que gestiona:
- Estado global de la aplicación
- Vista activa (dashboard, zonas, especies, buscar)
- Fetching inicial de datos
- Modal de zona seleccionada

### 2. **Header**
- Logo y branding
- Navegación principal
- Botón de notificaciones

### 3. **Dashboard**
Vista principal con:
- 4 tarjetas de estadísticas (StatCard)
- Grid de mejores oportunidades (OportunidadCard)
- Placeholder de mapa interactivo

### 4. **StatCard**
Tarjeta con métrica importante:
- Ícono representativo
- Valor numérico grande
- Label descriptivo
- Trend/contexto

### 5. **OportunidadCard**
Tarjeta de oportunidad de recolección:
- Score circular animado (SVG)
- Nombre científico y común
- Zona y provincia
- Probabilidad categorizada
- Días estimados hasta fructificación

### 6. **ZonasView**
Lista de todas las zonas con:
- Información básica
- Coordenadas geográficas
- Tipo de bosque y altitud
- Click para abrir modal

### 7. **EspeciesView**
Catálogo de especies:
- Nombre científico
- Nombres comunes
- Badge de comestibilidad (color-coded)

### 8. **BuscarView**
Búsqueda avanzada con:
- Filtros (provincia, score mínimo)
- Resultados en grid
- Actualización en tiempo real

### 9. **ZonaModal**
Modal con detalles completos de zona:
- Condiciones climáticas actuales (temperatura, precipitación, humedad)
- Lista de especies probables con scores
- Factores positivos/negativos

### 10. **LoadingState**
Estado de carga con spinner animado

---

## 🔌 INTEGRACIÓN CON API

### Configuración
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### Endpoints Utilizados

**Dashboard:**
```javascript
GET /zonas?limit=20
GET /especies?limit=10
GET /buscar?min_score=70&limit=15
```

**Zona Detalles:**
```javascript
GET /zonas/{zona_id}/clima
GET /zonas/{zona_id}/scores?min_score=50
```

**Búsqueda:**
```javascript
GET /buscar?min_score={score}&provincia={provincia}
```

### Ejemplo de Fetch
```javascript
const fetchDashboardData = async () => {
  try {
    const [zonasRes, especiesRes, oportunidadesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/zonas?limit=20`),
      fetch(`${API_BASE_URL}/especies?limit=10`),
      fetch(`${API_BASE_URL}/buscar?min_score=70&limit=15`)
    ]);

    setZonas(await zonasRes.json());
    setEspecies(await especiesRes.json());
    setMejoresOportunidades(await oportunidadesRes.json());
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

---

## 🎭 ESTADOS Y FLUJOS

### Estados Principales
```javascript
const [view, setView] = useState('dashboard');
const [zonas, setZonas] = useState([]);
const [especies, setEspecies] = useState([]);
const [mejoresOportunidades, setMejoresOportunidades] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedZona, setSelectedZona] = useState(null);
const [filters, setFilters] = useState({
  provincia: '',
  minScore: 70
});
```

### Flujo de Navegación
```
Usuario entra → Dashboard (fetch inicial)
              ↓
         View switcher
              ↓
    ┌─────────┴─────────┐
    ↓         ↓         ↓
 Zonas    Especies   Buscar
    ↓
Click zona → ZonaModal (fetch detalles)
```

---

## 🎨 PERSONALIZACIÓN

### Cambiar Colores
Editar las clases Tailwind en App.jsx:

```javascript
// Ejemplo: cambiar color principal
from-[#1a3a2e]  →  from-[#tu-color]
border-[#8b6f47]  →  border-[#tu-color]
```

### Añadir Nueva Vista
1. Crear componente:
```javascript
function MiNuevaView({ data }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display text-3xl font-bold text-[#f4ebe1]">
        Mi Nueva Vista
      </h2>
      {/* Tu contenido */}
    </div>
  );
}
```

2. Añadir a navegación:
```javascript
{ id: 'minueva', label: 'Mi Nueva', icon: IconName }
```

3. Añadir al switch de vistas:
```javascript
{view === 'minueva' && <MiNuevaView data={data} />}
```

### Cambiar Fuentes
```javascript
// En el <style> dentro de App.jsx
@import url('https://fonts.googleapis.com/css2?family=TuFuente:wght@400;600;700&display=swap');

.font-display {
  font-family: 'TuFuente', serif;
}
```

---

## 📊 FUTURAS MEJORAS

### Corto Plazo
- [ ] Integrar mapa interactivo (Leaflet/Mapbox)
- [ ] Sistema de autenticación de usuarios
- [ ] Guardar zonas y especies favoritas
- [ ] Notificaciones push
- [ ] Modo oscuro/claro

### Medio Plazo
- [ ] Subir fotos de hallazgos
- [ ] Identificación IA desde el frontend
- [ ] Gráficos de tendencias climáticas (Chart.js/Recharts)
- [ ] Filtros avanzados multi-parámetro
- [ ] Exportar datos a PDF/Excel

### Largo Plazo
- [ ] App móvil nativa (React Native)
- [ ] Geolocalización en tiempo real
- [ ] Modo offline con PWA
- [ ] Compartir hallazgos en redes sociales
- [ ] Gamificación (badges, rankings)

---

## 🗺️ INTEGRACIÓN DE MAPA INTERACTIVO

### Opción 1: Leaflet (Recomendada - Open Source)

```bash
npm install react-leaflet leaflet
```

```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapaInteractivo({ zonas }) {
  return (
    <MapContainer 
      center={[41.5, 2.0]} 
      zoom={8} 
      style={{ height: '400px', borderRadius: '1rem' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {zonas.map(zona => (
        <Marker 
          key={zona.id} 
          position={[zona.latitud, zona.longitud]}
        >
          <Popup>
            <strong>{zona.nombre}</strong><br/>
            {zona.tipo_bosque}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Opción 2: Google Maps

```bash
npm install @react-google-maps/api
```

```javascript
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function MapaGoogle({ zonas }) {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={{ lat: 41.5, lng: 2.0 }}
        zoom={8}
      >
        {zonas.map(zona => (
          <Marker
            key={zona.id}
            position={{ lat: zona.latitud, lng: zona.longitud }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
```

---

## 🔐 AUTENTICACIÓN (Futuro)

### Setup con JWT

```bash
npm install jwt-decode
```

```javascript
// services/auth.js
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Uso en fetch
fetch(`${API_BASE_URL}/zonas`, {
  headers: { ...getAuthHeader() }
});
```

---

## 📱 RESPONSIVE DESIGN

La app es completamente responsive gracias a Tailwind:

- **Mobile**: Layout de 1 columna
- **Tablet (md)**: Grid de 2 columnas
- **Desktop (lg)**: Grid de 3 columnas

### Breakpoints
```javascript
// Tailwind breakpoints usados:
sm: 640px   // No usado actualmente
md: 768px   // Tablets
lg: 1024px  // Desktop
xl: 1280px  // No usado
```

### Testing Responsive
```bash
# Chrome DevTools
F12 → Toggle device toolbar (Ctrl+Shift+M)

# Tamaños recomendados a probar:
- iPhone SE: 375x667
- iPad: 768x1024
- Desktop: 1920x1080
```

---

## 🐛 DEBUGGING

### React DevTools
```bash
# Instalar extensión de navegador
Chrome: React Developer Tools
Firefox: React Developer Tools
```

### Console Logs
```javascript
// Ya incluidos en el código:
console.error('Error fetching data:', error);
console.log('Datos obtenidos:', data);
```

### Network Monitoring
```
F12 → Network tab
Filter: XHR/Fetch
Verificar status codes (200, 404, 500)
```

---

## ⚡ OPTIMIZACIÓN

### Performance

**Actual:**
- React.StrictMode habilitado
- Tailwind CSS via CDN (rápido para desarrollo)
- Lazy loading de modales

**Mejoras futuras:**
```bash
# Tailwind production build (más pequeño)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# Code splitting por ruta
import { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./Dashboard'));

# Memoización de componentes pesados
import { memo } from 'react';
const OportunidadCard = memo(({ oportunidad }) => { ... });
```

### SEO (si aplica)

```javascript
// react-helmet para meta tags dinámicos
npm install react-helmet

import { Helmet } from 'react-helmet';

<Helmet>
  <title>MicoMapa - {zona.nombre}</title>
  <meta name="description" content={`Condiciones para ${zona.nombre}`} />
</Helmet>
```

---

## 🧪 TESTING

### Setup (futuro)

```bash
# Jest + React Testing Library (incluido en create-react-app)
npm test

# Ejemplo de test
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MicoMapa title', () => {
  render(<App />);
  const titleElement = screen.getByText(/MicoMapa/i);
  expect(titleElement).toBeInTheDocument();
});
```

---

## 📦 DEPLOYMENT

### Netlify

```bash
# 1. Build
npm run build

# 2. Conectar repo a Netlify
# 3. Configurar:
Build command: npm run build
Publish directory: build
Environment variables: REACT_APP_API_URL
```

### Vercel

```bash
# Similar a Netlify
vercel --prod
```

### Servidor Propio (Nginx)

```nginx
server {
    listen 80;
    server_name micomapa.com;
    root /var/www/micomapa/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

---

## 🆘 TROUBLESHOOTING

### Problema: API no responde
```
✓ Verificar que backend esté corriendo en puerto 8000
✓ Comprobar REACT_APP_API_URL en .env
✓ Verificar CORS en backend (api_backend.py)
```

### Problema: Estilos no cargan
```
✓ Verificar que Tailwind CDN esté en index.html
✓ Limpiar caché del navegador (Ctrl+Shift+R)
✓ Comprobar red para CDN bloqueado
```

### Problema: Build falla
```
✓ Limpiar node_modules: rm -rf node_modules && npm install
✓ Verificar versión de Node: node -v (debe ser 16+)
✓ Revisar console para errores específicos
```

---

## 📞 SOPORTE

- **Documentación API Backend**: http://localhost:8000/docs
- **Issues**: Reportar bugs o feature requests
- **Código fuente**: Todos los archivos incluidos

---

## ✅ CHECKLIST POST-INSTALACIÓN

- [ ] Node.js 16+ instalado
- [ ] npm install completado sin errores
- [ ] .env creado con API_URL correcta
- [ ] Backend corriendo en puerto 8000
- [ ] npm start funciona correctamente
- [ ] App se abre en localhost:3000
- [ ] Dashboard carga datos correctamente
- [ ] Navegación entre vistas funciona
- [ ] Modal de zona se abre y cierra
- [ ] Filtros de búsqueda funcionan
- [ ] Responsive en móvil verificado

---

**¡Frontend de MicoMapa listo para usar! 🍄✨**

La aplicación está completamente funcional y lista para conectarse a tu backend. Simplemente asegúrate de tener el API corriendo y disfruta explorando las mejores zonas para recolectar setas.
