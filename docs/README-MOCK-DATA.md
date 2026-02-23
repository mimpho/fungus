# 🍄 MICOMAPA - VERSIÓN CON DATOS MOCKEADOS
## Demo Standalone Sin Dependencias

---

## 🎯 ¿QUÉ INCLUYE ESTA VERSIÓN?

He creado **3 formas diferentes** de ver MicoMapa funcionando sin necesidad de backend ni base de datos:

### **1. HTML Standalone** ⭐ **MÁS FÁCIL**
**Archivo**: `micomapa-standalone.html`

✅ **Un solo archivo HTML**  
✅ **Abre directamente en el navegador** (doble clic)  
✅ **Sin instalación de nada**  
✅ **Todas las dependencias via CDN**  
✅ **Datos mockeados embebidos**  

**Cómo usarlo:**
```bash
# Simplemente abre el archivo en Chrome/Firefox/Safari
# O arrastra el archivo al navegador
```

---

### **2. Frontend React con Mock Data**
**Carpeta**: `frontend/`

✅ **Proyecto React completo**  
✅ **mockData.js con datos realistas**  
✅ **Switch para alternar entre mock y API real**  
✅ **Listo para desarrollo**  

**Cómo usarlo:**
```bash
cd frontend
npm install
npm start

# Se abrirá en http://localhost:3000
# Por defecto usa datos mockeados (USE_MOCK_DATA = true)
```

**Para cambiar a API real:**
```javascript
// En src/App.jsx, línea 5
const USE_MOCK_DATA = false; // Cambiar a false
```

---

### **3. Frontend Original (Requiere Backend)**
Si quieres conectar al backend real:

```bash
# 1. Asegúrate de tener el backend corriendo
uvicorn api_backend:app --reload --port 8000

# 2. En frontend, cambia USE_MOCK_DATA a false
# 3. Configura .env
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# 4. Inicia
npm start
```

---

## 📦 DATOS MOCKEADOS INCLUIDOS

### **Zonas (10)**
- Pinar de Urbión (Soria)
- Hayedo del Ripollès (Girona)
- Robledal del Montseny (Barcelona)
- Pinar de Lleida (Lleida)
- Hayedo de la Garrotxa (Girona)
- Bosque Mixto del Berguedà (Barcelona)
- Encinar del Priorat (Tarragona)
- Pinar de Solsonès (Lleida)
- Robledal de Els Ports (Tarragona)
- Hayedo del Cadi (Girona)

**Cada zona incluye:**
- Coordenadas GPS (latitud, longitud)
- Altitud
- Tipo de bosque (pinar, hayedo, robledal, mixto, encinar)
- pH del suelo
- Características del terreno

### **Especies (10)**
- Boletus edulis (Excelente)
- Lactarius deliciosus (Excelente)
- Cantharellus cibarius (Excelente)
- Amanita caesarea (Excelente)
- Amanita muscaria (Tóxica) ⚠️
- Amanita phalloides (Mortal) ☠️
- Macrolepiota procera (Buena)
- Tricholoma terreum (Buena)
- Pleurotus ostreatus (Buena)
- Hygrophorus latitabundus (Comestible)

**Cada especie incluye:**
- Nombre científico y nombres comunes
- Familia micológica
- Comestibilidad (excelente, bueno, tóxico, mortal)
- Temperaturas óptimas
- Precipitación necesaria
- Meses de fructificación
- Tipos de bosque compatibles

### **Oportunidades (10)**
Combinaciones zona-especie con:
- Score total (0-100)
- Probabilidad (excelente, muy_alta, alta, moderada, baja)
- Días estimados hasta fructificación
- Datos climáticos actuales

### **Clima por Zona (5)**
- Temperatura media actual
- Precipitación últimos 14 días
- Humedad relativa media
- Días desde última lluvia

### **Scores Detallados (por zona)**
- Scores individuales por especie
- Factores positivos y negativos
- Explicaciones detalladas

### **Hallazgos (3)**
- Reportes simulados de usuarios
- Fecha, ubicación, abundancia
- Estado y calidad de los hongos

---

## 🎨 FUNCIONALIDADES DISPONIBLES EN DEMO

### ✅ **Dashboard**
- Ver mejores oportunidades hoy
- 4 tarjetas de estadísticas
- Scores circulares animados
- Click en oportunidad → Modal con detalles

### ✅ **Vista de Zonas**
- Grid de todas las zonas
- Información geográfica
- Tipo de bosque y altitud

### ✅ **Vista de Especies**
- Catálogo completo
- Nombres científicos y comunes
- Badges de comestibilidad color-coded

### ✅ **Modal de Zona**
- Condiciones climáticas actuales
- Lista de especies probables con scores
- Factores positivos/negativos

### ✅ **Animaciones**
- Transiciones suaves
- Scores circulares animados
- Hover effects
- Loading states

---

## 🔄 ESTRUCTURA DEL mockData.js

```javascript
// Datos
export const mockZonas = [...];
export const mockEspecies = [...];
export const mockMejoresOportunidades = [...];
export const mockClimaZonas = {...};
export const mockScoresZonas = {...};
export const mockHallazgos = [...];

// Mock API Service (simula fetch con delays)
export const mockAPIService = {
  async getZonas(params) { ... },
  async getEspecies(params) { ... },
  async buscar(params) { ... },
  async getClimaZona(zonaId) { ... },
  async getScoresZona(zonaId) { ... },
  // ... más métodos
};

// Helper para simular latencia de red
export const delay = (ms = 300) => ...;
```

---

## 🎯 CASOS DE USO

### **1. Demo para Inversores/Stakeholders**
```bash
# Usa: micomapa-standalone.html
# Ventaja: Sin instalación, funciona inmediatamente
# Perfecto para presentaciones
```

### **2. Desarrollo Frontend Sin Backend**
```bash
# Usa: frontend/ con USE_MOCK_DATA = true
# Ventaja: Desarrollo rápido sin esperar backend
# Hot reload con npm start
```

### **3. Testing de UI/UX**
```bash
# Usa: frontend/ con mock data
# Ventaja: Datos consistentes para testing
# Puedes modificar mockData.js fácilmente
```

### **4. Documentación y Capturas**
```bash
# Usa: cualquiera
# Ventaja: Datos bonitos y coherentes
# Perfecto para README, docs, screenshots
```

---

## 🔧 PERSONALIZAR DATOS MOCK

### Añadir Nueva Zona

```javascript
// En mockData.js
export const mockZonas = [
  // ... zonas existentes
  {
    id: 'zona-011',
    nombre: 'Tu Nueva Zona',
    provincia: 'Barcelona',
    comarca: 'Tu Comarca',
    latitud: 41.5,
    longitud: 2.1,
    altitud: 1000,
    tipo_bosque: 'mixto',
    ph_suelo: 5.8,
    // ... más propiedades
  }
];
```

### Añadir Nueva Especie

```javascript
export const mockEspecies = [
  // ... especies existentes
  {
    id: 'esp-011',
    nombre_cientifico: 'Agaricus campestris',
    nombres_comunes: ['Champiñón silvestre'],
    comestibilidad: 'bueno',
    familia: 'Agaricaceae',
    // ... requisitos de fructificación
  }
];
```

### Modificar Scores

```javascript
// Cambiar scores de una zona
export const mockScoresZonas = {
  'zona-001': [
    {
      especie_nombre: 'Boletus edulis',
      score_total: 95.0, // Cambiar score
      probabilidad: 'excelente',
      // ...
    }
  ]
};
```

### Ajustar Delays de Red

```javascript
// Hacer la app más rápida/lenta
export const delay = (ms = 100) => ... // Más rápido
export const delay = (ms = 1000) => ... // Más lento
```

---

## 🚀 VENTAJAS DE USAR MOCK DATA

### **Para Desarrollo**
✅ **Desarrollo frontend independiente** del backend  
✅ **Testing consistente** con datos predecibles  
✅ **Prototipado rápido** de nuevas features  
✅ **Demos funcionales** sin infraestructura  

### **Para Presentaciones**
✅ **Sin dependencias** de red/servidores  
✅ **Datos bonitos** y coherentes  
✅ **Funcionamiento garantizado** en cualquier lugar  
✅ **Control total** sobre qué se muestra  

### **Para Testing**
✅ **Edge cases** fáciles de simular  
✅ **Datos de prueba** modificables rápidamente  
✅ **Sin rate limits** de APIs reales  
✅ **Reproducibilidad** perfecta  

---

## 📊 COMPARACIÓN DE OPCIONES

| Característica | Standalone HTML | React con Mock | React con Backend |
|----------------|-----------------|----------------|-------------------|
| **Instalación** | ✅ Ninguna | ⚠️ npm install | ⚠️ npm + backend |
| **Velocidad** | ✅ Instantánea | ✅ Rápida | ⚠️ Depende red |
| **Desarrollo** | ❌ No hot reload | ✅ Hot reload | ✅ Hot reload |
| **Datos** | ✅ Embebidos | ✅ mockData.js | ✅ API real |
| **Portable** | ✅ 100% | ⚠️ Requiere npm | ❌ Requiere backend |
| **Uso en Prod** | ❌ Solo demo | ❌ Solo dev | ✅ Producción |

---

## 🎓 MIGRACIÓN A DATOS REALES

Cuando tengas el backend listo:

### **Paso 1**: Cambiar flag
```javascript
// src/App.jsx
const USE_MOCK_DATA = false; // ← Cambiar a false
```

### **Paso 2**: Configurar API URL
```bash
# .env
REACT_APP_API_URL=http://tu-servidor.com:8000
```

### **Paso 3**: (Opcional) Eliminar mock
```javascript
// Si ya no necesitas mock, puedes eliminarlo
// Pero es útil mantenerlo para desarrollo
```

---

## 🐛 TROUBLESHOOTING

### Standalone HTML no carga
```
✓ Abre en Chrome/Firefox (no IE)
✓ Permite JavaScript en el navegador
✓ Revisa la consola (F12) por errores
✓ Prueba en modo incógnito
```

### React no encuentra mockData
```
✓ Verifica que mockData.js esté en src/
✓ Comprueba el import: import mockAPIService from './mockData';
✓ Ejecuta: npm install
```

### Datos no se muestran
```
✓ Abre consola del navegador (F12)
✓ Busca errores en Network tab
✓ Verifica que USE_MOCK_DATA = true
✓ Limpia caché: Ctrl+Shift+R
```

---

## 📝 NOTAS FINALES

### **Mock Data es Realista**
Los datos mockeados están basados en:
- Zonas reales de Cataluña
- Especies comunes en España
- Scores calculados con el algoritmo real
- Condiciones climáticas típicas de invierno

### **Fácil de Extender**
Puedes añadir fácilmente:
- Más zonas
- Más especies
- Diferentes estaciones del año
- Casos edge (scores muy altos/bajos)

### **Listo para Demos**
Todo está configurado para:
- Presentaciones a inversores
- Demos a usuarios beta
- Screenshots para marketing
- Videos promocionales

---

## ✅ CHECKLIST

- [x] HTML standalone funcional (un solo archivo)
- [x] React con mock data (desarrollo)
- [x] 10 zonas con datos completos
- [x] 10 especies (comestibles y tóxicas)
- [x] 10 oportunidades con scores
- [x] Datos climáticos por zona
- [x] Scores detallados por especie
- [x] Hallazgos de usuarios
- [x] Delays de red simulados
- [x] Switch mock/real API
- [x] Documentación completa

---

**¡Ahora puedes mostrar MicoMapa funcionando sin necesidad de servidor! 🍄✨**

Simplemente abre `micomapa-standalone.html` en tu navegador y disfruta de la demo completa.
