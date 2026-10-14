# PRD — Observatorio: mapa libre por coordenadas, celdas y puntos marcados

> Copia en el repo del documento de Claude Docs «PRD — Observatorio: mapa libre por coordenadas, celdas y puntos marcados» (fuente de verdad: el documento). Última actualización: 2026-10-14.
> Complementa `memory/observatory-prd.md` (fase 1, zonas) y `memory/observatory-plan.md` (plan técnico; apartado «Update 2026-10-14»).

## Resumen y visión

El Observatorio deja de estar limitado a las zonas guardadas: con un clic en el mapa de Cataluña, la persona usuaria con sesión iniciada verá los mismos widgets para cualquier punto, calculados con datos de Open-Meteo. Las zonas actuales pasan a ser puntos marcados: coordenadas con nombre y notas.

Fungus se plantea como un producto informativo y de fondo casi académico, pensado para culturizarse en micología. Esporas.io, la aplicación que ha servido de contraste, es más práctica y orientada a la recolección, con un catálogo de unas 10 setas. No se busca competir con ella sino ocupar un nicho distinto.

Este documento recoge la propuesta, las decisiones tomadas hasta el 14 de octubre de 2026, los resultados de las pruebas contra las APIs y un anexo técnico. Con estas decisiones, el desarrollo de `feat/observatory-api` puede retomarse.

## Decisiones tomadas

| Tema | Decisión |
| --- | --- |
| Ámbito | Se empieza solo por Cataluña. |
| Acceso | El Observatorio exige tener sesión iniciada. |
| Entrada | Clic en el mapa. Un menú contextual muestra el topónimo más cercano y el botón «Observar esta zona» antes de enseñar los widgets. |
| Datos | Open-Meteo es la fuente de verdad. La base de datos es una caché reconstruible y la celda de la rejilla es la unidad de base. |
| Punto marcado | Coordenadas con nombre, y de momento poco más: altitud, tipo de bosque y notas. Los puntos con información rica del libro quedan para una fase futura. |
| Zonas actuales | Las 40 zonas curadas siguen en la sección Zonas, sin cambios, y no se muestran en el Observatorio v1. Pasarán a ser puntos marcados cuando se revisen sus coordenadas. Las 150 activas no curadas se desactivan, de forma reversible. |
| Guardar un punto | El nombre propuesto es el topónimo más cercano. Se puede cambiar al guardar y después, y hay un campo de notas. |
| Tipo de bosque | Macrotipo (conífera, frondosa, esclerófilo) y exclusión de urbano y agrícola con las cobertes del ICGC, consultadas en el punto del clic. Las especies presentes, con su porcentaje en un radio de unos 300 m, salen del Mapa de cobertes del sòl de Catalunya (MCSC-4, CREAF, 2009), preprocesado a una cuadrícula local, y el índice se calcula por cada tipo presente por encima del 10 %. |
| Mapa libre (v1) | El Observatorio muestra solo resultados por coordenadas. No aparecen en él los puntos de interés ni las zonas curadas. |
| Sección Zonas | Se queda como está, con seguimientos y ranking. |
| Celdas | En v1 se cargan bajo demanda, en el primer clic de alguien, sin enumerar la rejilla. |
| Índice por tipo | Si hay varios tipos de bosque por encima del 10 % alrededor del punto, el índice se calcula para cada uno y se muestran todos, cada uno con su porcentaje. |

## Problema

Hoy el Observatorio solo trabaja con las zonas registradas en la base de datos, y eso limita tanto la búsqueda como los mapas.

- **Buscador:** solo devuelve las zonas que se siguen. Quien quiere mirar otro lugar no puede.
- **Mapa de calor:** se rellena únicamente con los puntos guardados, así que es poco preciso entre zona y zona.
- **Qué se gana con la base propia:** poder trabajar con los datos sin hacer peticiones continuas. Ese beneficio se mantiene, pero no justifica que sea la única vía.

Por contraste, una aplicación que acepta cualquier ubicación ofrece temperatura, precipitación acumulada y probabilidad de fructificación en tiempo real, lo que resulta mucho más rico para quien consulta.

## Propuesta

Tres piezas que conviven, cada una con un papel distinto.

| Pieza | Qué es | De dónde salen los datos | Qué aporta |
| --- | --- | --- | --- |
| Clic en el mapa | Cualquier punto de Cataluña se asocia a una celda de la rejilla de Open-Meteo y muestra los widgets del Observatorio | Historial y previsión de la celda, con corrección de altitud | Mirar cualquier lugar sin límite de zonas y con histórico suficiente para el cálculo |
| Celdas | Rejilla irregular de Open-Meteo, de unos 84 km² por celda. Unas 380 en Cataluña y entre 200 y 250 con bosque | Caché en base de datos, reconstruible desde Open-Meteo | Mapa de calor y respuesta rápida sin repetir peticiones |
| Puntos marcados | Coordenadas guardadas con nombre y notas, propias de cada usuario o destacadas por Fungus | Metadatos en base de datos. El clima sale de su celda | Seguir un lugar, ponerle nombre y volver a él |

Cualquier punto tiene histórico, porque Open-Meteo lo ofrece: la celda se reconstruye con unos 280 días (180 de línea de tiempo y 100 de calentamiento del cálculo). Lo que aporta un punto marcado no es más histórico, sino nombre, notas y seguimiento.

## Experiencia de usuario

La persona usuaria puede mirar cualquier lugar, no solo los que Fungus ha preparado.

1. **Entrar con sesión iniciada.** El Observatorio no es público.
2. **Hacer clic en el mapa.** Un menú contextual muestra el topónimo más cercano y el botón «Observar esta zona». También se pueden introducir coordenadas.
3. **Ver la zona.** Temperatura, suelo, lluvia acumulada, previsión y calendario, calculados con los datos de la celda, junto con las especies de bosque presentes alrededor del punto y su porcentaje. Se avisa de que la lluvia es un dato de celda, de unos 10 km.
4. **Guardar el punto.** El nombre propuesto es el topónimo más cercano, editable en ese momento y más tarde, con un campo de notas.
5. **Explorar el mapa de calor.** Una vista general del territorio, solo sobre zonas forestales, que se lee de la caché de celdas. Más adelante, también por tipo de árbol, a partir de la misma cuadrícula de especies.

Las zonas actuales no desaparecen: la sección Zonas sigue como hasta ahora, con seguimientos y ranking. El Observatorio v1 trabaja solo con coordenadas y no muestra puntos de interés ni zonas curadas. Las 40 curadas, que proceden del libro del autor, podrán ser puntos marcados cuando se revisen sus coordenadas.

Pendiente de definir: cómo se muestran los últimos 5 a 8 días, que son provisionales. Salen de la previsión y pueden diferir en torno a 0,5 °C del archivo definitivo, que llega con unos 5 días de retraso.

## Principios de producto y modelo de negocio

Fungus no nace para lucrarse y no debe costar dinero de su bolsillo a quien lo mantiene.

- **Sin lucro por ahora.** No se está en fase de decidir cómo monetizar. Eso vendría después, solo si el producto demuestra ser bueno.
- **Devolver al bosque.** Si algún día hubiera un modelo de negocio, la intención de fondo es destinar las ganancias a algo relacionado con la naturaleza, con la micología o sin ella, para cerrar el círculo. No hay plan concreto y no se quiere decidir ahora.
- **Coste controlado.** La consulta en tiempo real de cualquier punto implica gasto por petición. Si el uso no genera ingresos, ese gasto debe quedar acotado por diseño.
- **Sin límites de origen.** No se quiere construir algo que nazca limitado, aunque hoy no se monte toda la infraestructura de escala.

El contexto de escala es real: la página de Facebook "Bullets", creada por el autor, tiene unos 70.000 usuarios. Si el Observatorio se promociona ahí, el tráfico puede dispararse de golpe.

## Riesgos y preguntas abiertas

El riesgo principal es el coste y la caída del servicio si el tráfico se dispara; el resto son decisiones que aún no se han tomado.

- **Tráfico y coste.** El plan gratuito de Open-Meteo es solo para uso no comercial y tiene límite diario. Con celdas en caché y sesión obligatoria, el gasto debería depender de cuántas celdas se refrescan y no de cuántas personas miran. Un pico viral sigue siendo el caso a vigilar.
- **Lluvia a escala de celda.** La celda mide unos 8 × 11 km y la lluvia no se corrige por altitud. En terreno escarpado el dato puede alejarse mucho del punto (en Santa Fe la altitud media de la celda es 667 m y la del punto 1.380 m).
- **Tipo de bosque.** Open-Meteo no lo da. Sin él no hay base para los widgets de especies. Las cobertes del ICGC dan el macrotipo de bosque y funcionan en la prueba. La especie sale del MCSC-4 del CREAF (shapefile por hojas, nivel 5), que distingue encinar, alcornocal, hayedo, robledales y varios pinares, pero es de 2009 y hay que cruzarlo con las cobertes de 2024 para no mostrar especies donde ya no hay bosque. El servicio WMS del MFE no es utilizable.
- **Costura entre previsión y archivo.** Los últimos días vienen de la previsión y difieren del archivo. Hay que marcarlos como provisionales y sustituirlos con un job.
- **Condiciones de uso.** Las cobertes del ICGC tienen licencia CC BY 4.0, con atribución. El geocodificador inverso del ICGC responde sin autenticación, pero no declara licencia ni límites. El MCSC-4 del CREAF solo dice que es de libre utilización, sin licencia concreta: hay que confirmarla con el CREAF o el ICGC antes de publicar, sobre todo para un mapa de calor visible.
- **Rejilla.** Es irregular, así que en v1 no se enumeran las celdas: se cargan bajo demanda en el primer clic de alguien. La enumeración y la máscara forestal harán falta para el mapa de calor.
- **Fiabilidad de las zonas antiguas.** Las coordenadas de unas 150 zonas no curadas son poco precisas (error mediano de altitud de 229 m). Por eso se desactivan.

## Anexo técnico

Todo el cálculo puede alimentarse desde Open-Meteo con un adaptador nuevo, pero el plan de pago que haría falta para uso comercial es el Professional, no el Standard, porque solo el primero incluye la API de histórico.

### APIs de Open-Meteo que se usarían

| Necesidad | API | Nota |
| --- | --- | --- |
| Nombre de lugar a coordenadas | Open-Meteo Geocoding | Solo busca por nombre y sobre todo localidades. No sirve para el clic en el mapa |
| Topónimo más cercano a unas coordenadas | Geocodificador inverso del ICGC | Capas `topo1` (núcleos de población) y `topo2` (resto de topónimos), radio por defecto de 1 km. Solo Cataluña |
| Ventana reciente y años anteriores | Historical Weather | Datos desde 1940, con unos 5 días de retraso. En planes de pago exige Professional |
| Últimos días y previsión | Forecast | Hasta 16 días contando hoy. `past_days` llega a 92, pero solo unos 73 días traen datos |

### Límites y coste

| | Gratis | Standard | Professional |
| --- | --- | --- | --- |
| Uso comercial | No | Sí | Sí |
| Límite diario | 10.000 llamadas | Sin límite | Sin límite |
| Límite mensual | 300.000 llamadas | 1 millón | 5 millones |
| Historical Weather API | Sí | No | Sí |

El plan gratuito también limita a 5.000 llamadas por hora y 600 por minuto. Una petición de más de 10 variables, o de más de 14 días, cuenta como varias llamadas: el peso es aproximadamente los días divididos entre 14. Con unas 380 celdas, la primera carga de 280 días pesa del orden de 7.600 llamadas, menos de un día de cuota gratuita. Con unos 740 días, para comparar con el año anterior, serían entre 13.000 y 16.000, unos dos días. Son estimaciones.

El precio del Standard es de 29 dólares al mes según una página de suscripciones de Open-Meteo. La página de precios abierta no muestra importes y el del Professional no está verificado.

### Pruebas realizadas contra Open-Meteo

Se ejecutaron seis pruebas entre el 11 y el 12 de octubre de 2026 con scripts en `backend/scripts`.

| Prueba | Resultado |
| --- | --- |
| Ventana de datos | `past_days=92` solo trae unos 73 días con datos, y los más antiguos vienen vacíos. La ventana se construye con archivo más los últimos días de previsión |
| Rejilla | Irregular, de unos 7,8 × 10,8 km. `cell_selection=land` puede elegir una celda vecina de altitud parecida |
| Altitud | Temperatura y suelo bajan 0,65 °C por cada 100 m, exacto. La humedad baja 0,13 puntos por 100 m. Lluvia y viento no se corrigen |
| Celda corregida frente a consulta directa | La temperatura queda bien. Lluvia y viento quedan limitados por la escala de la celda |
| Costura previsión y archivo | La lluvia de la previsión es entre 0,24 y 2,12 veces la del archivo según el punto. La mínima sube entre 0,5 y 1 °C, el suelo baja entre 0,4 y 0,9 °C y la humedad baja unos 2 puntos. La mejor petición de previsión usa las coordenadas de la celda y la elevación media de la celda |
| Auditoría de las 40 zonas curadas | Lo guardado coincide con el archivo de Open-Meteo, con sesgo y error de 0,00. Los fallos iniciales fueron timeouts. En los últimos 5 días, la temperatura media guardada difiere de media unos 0,5 °C (entre 0,16 y 1,12) y la del suelo unos 0,55 °C (entre 0,14 y 0,94) |

La auditoría solo comprueba la coherencia de lo guardado con las mismas coordenadas, no que esas coordenadas sean las correctas.

### Tipo de bosque y topónimo

Open-Meteo no da el tipo de bosque, y los widgets de especies lo necesitan. El 12 de octubre de 2026 se probaron tres servicios públicos sobre 12 puntos de Cataluña con `probe_geo.py`.

| Necesidad | Servicio | Resultado de la prueba |
| --- | --- | --- |
| Macrotipo de bosque y exclusión de urbano y agrícola | [Cobertes del sòl del ICGC](https://www.icgc.cat/en/Geoinformation-and-Maps/Online-services-Geoservices/WMS-Land-cover), capa `cobertes_2024`, consulta por punto | Funciona. Devuelve clases como bosque denso de aciculífolis, de caducifolis planifolis y de escleròfil·les, además de prados, roquedo, casco urbano y eixample. Distingue conífera, frondosa y esclerófilo, pero no la especie. Acertó en Montnegre, Ports, Cadí, Cap de Creus y Vic |
| Especie dominante | [Mapa Forestal de España](https://sig.mapama.gob.es/Docs/PDFServicios/MFE.pdf) (MFE25, WMS) | No se pudo consultar. Desde Python en el Mac falló la verificación del certificado SSL de `wms.mapama.gob.es`. Dos fallos del servidor. Primero, no envía el certificado intermedio de la FNMT, algo que se resuelve añadiéndolo como confianza. Después, la dirección documentada no devuelve capas y la variante wms.aspx responde con un error interno. Se descarta como servicio en vivo. Falta confirmar si existe una descarga del mapa |
| Topónimo más cercano | [Geocodificador inverso del ICGC](https://openicgc.github.io/geocodificador-doc_en/parametres_invers/) | Funciona. Respondió en los 12 puntos, en 0,06 a 0,15 s, con radio de 1 km. `topo1` da núcleos y barrios, y `topo2` da cimas, collados, masías y parajes de monte, como Turó de l'Home o Coll Pregon |

Tres puntos de control no coincidieron con lo esperado, y lo más probable es que se deba a las coordenadas de prueba: la Fageda d'en Jordà salió como cultivo, Santa Fe como roquedo de cumbre y el llano de Lleida cayó dentro de la ciudad. Esto último confirma que la detección de urbano funciona, pero falta un punto agrícola de verdad. La propuesta es consultar las cobertes en el punto exacto del clic y guardar el resultado, porque una celda de 84 km² mezcla bosques distintos y el dato casi no cambia. La especie sale de otra fuente, descrita más abajo. El MFE queda descartado como servicio en vivo.

Comprobación con las 40 zonas curadas (13 de octubre de 2026): se comparó el macrotipo de las cobertes con el tipo guardado, en cinco puntos de unos 150 m. En 22 zonas el punto cae en bosque y en 17 de ellas (77 %) el macrotipo coincide con el guardado. Las 5 discrepancias son zonas mixtas o dudosas, como pinar frente a encinar o robledal frente a pinar, y no se ha comprobado cuál de los dos datos acierta. En las otras 18 zonas el punto cae fuera del bosque: matorral, prados, roquedo, cultivos, casco urbano o carretera. Lo más probable es que sea un problema de las coordenadas guardadas y no del macrotipo, y obliga a revisarlas antes de usar esas zonas como puntos marcados.

Regla propuesta: si no hay bosque en el punto, los widgets de clima se muestran igual, porque dependen de la celda, y los de especies se ocultan o avisan de que no hay bosque ahí.

### Especie y composición: MCSC-4 del CREAF

El 14 de octubre de 2026 se descartó la capa `cobertes_2009` del WMS del ICGC: devuelve la misma leyenda de 41 clases que la de 2024, sin especies. Lo que sí funciona es la descarga por hojas del Mapa de cobertes del sòl de Catalunya, 4.ª edición (CREAF, 2009, escala 1:5.000), en formato shapefile. El formato MiraMon (`.mmz`) es propio y sin lector libre, y se descartó.

La tabla de atributos lleva en el campo `C_SIMPLE` un código de nivel 5 con la especie y la densidad de copa. Por ejemplo, `bqi20` es alzinar con copa de al menos el 20 % y `bqi5` es alzinar con copa del 5 al 20 %.

| Código | Clase | Macrotipo | Origen del significado |
| --- | --- | --- | --- |
| `bqi` | Alzinar | esclérofilo | Leyenda oficial |
| `bqh` | Roureda de roure martinenc | caducifolio | Leyenda oficial |
| `bps` | Pineda de pi roig | conífera | Leyenda oficial |
| `bpp` | Pineda de pi pinyer | conífera | Leyenda oficial |
| `bph` | Pineda de pi blanc | conífera | Leyenda oficial |
| `bfs` | Fageda | caducifolio | Confirmado en Santa Fe |
| `bqs` | Sureda | esclérofilo | Inferido |
| `bqp` | Roureda de roure pènol | caducifolio | Inferido |
| `bcad` | Altres caducifolis | caducifolio | Leyenda oficial |
| `bribc` | Bosc caducifoli de ribera | caducifolio | Leyenda oficial |

Comprobación con las zonas curadas que caen en tres hojas descargadas (364-2-1, 363-2-1 y 365-1-1), con la composición en un radio de 300 m:

| Zona | Tipo guardado | Composición a 300 m |
| --- | --- | --- |
| 233 Fageda de Santa Fe | hayedo | Fageda 95 % |
| 226 Riells i Montseny | encinar | Alzinar 50 %; sureda 47 % |
| 205 Coll de Bordoriol | robledal | Alzinar 50 %; roure pènol 40 % |
| 003 La Pineda Fosca | robledal | Alzinar 50 %; pi pinyer 46 % |
| 208 Obagues del Moianès | pinar | Sin bosque 98 % |

El MCSC-4 distingue las especies, y mostrar solo una es una simplificación: en tres de las cuatro zonas con bosque la segunda especie pesa entre el 40 y el 50 %. La zona 003 no tiene ningún roble y se llama «Pineda», así que el tipo guardado es casi seguro un error. En la 208 la coordenada cae sobre edificios, como ya se sabía. Son cinco zonas, una muestra pequeña.

- **Composición, no especie dominante.** El widget muestra todas las especies presentes en un radio de unos 300 m del clic, con su porcentaje, por encima de un umbral del 10 %. Radio y umbral son parámetros que habrá que ajustar.
- **Índice por tipo.** Decisión del 14 de octubre: cuando hay varios tipos por encima del umbral, el índice se calcula para cada uno y la ficha los muestra todos.
- **Cruce con las cobertes 2024.** El MCSC-4 es de 2009. La especie solo se muestra si el macrotipo actual no la contradice, y donde ya no hay bosque no se muestra ninguna.
- **Preproceso.** Son alrededor de 500 hojas. Se convierten a una cuadrícula local de unos 25 m que guarda la clase de cada celda, sin agregar. Con ella se resuelven la composición alrededor de un clic, la máscara forestal y, más adelante, los mapas de calor por tipo de árbol.
- **Licencia pendiente.** La página del MCSC dice solo «de libre utilización». Hay que confirmarla antes de publicar. Las cobertes del ICGC sí son CC BY 4.0.

### Arquitectura propuesta

Hay una sola vía de datos. Open-Meteo alimenta la caché de celdas, un proveedor de series entrega la serie de una celda (o de una zona guardada) y todo pasa por el mismo `scoring_v2.py`. Los puntos marcados solo añaden nombre, notas y seguimiento. (El diagrama del documento original no se incluye en esta copia.)

### Jobs y caché

- **Carga inicial.** Al menos 280 días por celda, 180 de línea de tiempo y 100 de calentamiento. Unos 740 si se quiere superponer el año anterior.
- **Job diario.** Los días con más de unos 6 de antigüedad se piden al archivo, que es la fuente definitiva. Los últimos 5 a 8 días se piden a la previsión, como provisionales, y un job los sustituye cuando llega el archivo. El campo `source` de las filas debe distinguir ambos casos, hoy todas valen `open-meteo`.
- **Una llamada por celda.** Open-Meteo no devuelve una región entera, solo coordenadas concretas o listas cortas.
- **Celdas solo forestales.** El mapa de calor se limitará a celdas con bosque, con la máscara de las cobertes. En v1 las celdas se cargan bajo demanda en el primer clic, sin enumerar la rejilla. Se estiman entre 200 y 250 celdas con bosque de unas 380.
- **Corrección de altitud.** Temperatura y suelo se ajustan con 0,65 °C por 100 m entre la celda y el punto del clic.
- **Qué se guarda.** Solo lo que no se puede regenerar: los puntos marcados, los seguimientos, las notas, los resultados del score tal como se mostraron y la fecha de descarga. El histórico se puede reconstruir desde Open-Meteo. Los puntos guardados van en una tabla nueva: usuario, latitud, longitud, celda, nombre, notas, altitud y composición forestal en el momento de guardar.
- **Protección de coste.** Límite de peticiones por usuario y un freno si se acerca el tope diario. El diseño pendiente de `fix/weather-cache` ya contempla presupuesto diario y circuit breaker.

Orden de magnitud: unas 380 celdas en Cataluña, de las que entre 200 y 250 tendrían bosque. Son cifras estimadas que habrá que comprobar al enumerar la rejilla.

### Impacto en el desarrollo actual

- **Se reutiliza tal cual.** `scoring_v2.py` y `zone_projection.py` son funciones puras y no dependen del origen de los datos.
- **Cambia en `feat/observatory-api`.** Se introduce un proveedor de series por celda, con carga bajo demanda, y los endpoints se consultan por latitud y longitud en lugar de por zona. Las respuestas llevan `source: stored|live` y un `zone_id` que puede ser nulo.
- **Cambia después.** La ingesta, que pasa a trabajar por celdas, la página del Observatorio, con el mapa y el menú contextual, y `feat/observatory-forecast`, que hay que revisar.
- **Datos.** Las 150 zonas activas no curadas se desactivan. Los puntos guardados necesitan nombre, coordenadas, altitud, composición forestal y notas. El índice se calcula por cada tipo de bosque presente por encima del 10 %.
- **Pendiente de decidir.** La licencia del MCSC-4 y el preproceso de sus hojas a una cuadrícula local, que no bloquean `feat/observatory-api`.

### Fuentes

- [Pricing de Open-Meteo](https://open-meteo.com/en/pricing), abierta el 11 oct 2026
- [Geocoding API](https://open-meteo.com/en/docs/geocoding-api), [Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api) y [Forecast API](https://open-meteo.com/en/docs): solo vistas en resultados de búsqueda, sin abrir
- [ICGC Geocoder](https://www.icgc.cat/en/Tools-and-viewers/Tools/ICGC-Geocoder) y [parámetros del geocodificador inverso](https://openicgc.github.io/geocodificador-doc_en/parametres_invers/), abiertas el 12 oct 2026
- [WMS Land cover del ICGC](https://www.icgc.cat/en/Geoinformation-and-Maps/Online-services-Geoservices/WMS-Land-cover) y [características del MCSC-3](https://www.mcsc.creaf.cat/resu_res/CaracteristiquesResultatsMCSC3.pdf), abiertas el 12 oct 2026
- [Mapa Forestal de España](https://sig.mapama.gob.es/Docs/PDFServicios/MFE.pdf), abierta el 12 oct 2026
- Pruebas T1 a T6 ejecutadas por el autor entre el 11 y el 12 de octubre de 2026
- [Mapa de cobertes del sòl de Catalunya (ICGC)](https://www.icgc.cat/en/Geoinformation-and-Maps/Maps/Land-cover-map-Catalonia), CC BY 4.0, abierta el 14 oct 2026
- [Descarga del MCSC-4 en shapefile (CREAF)](https://www.mcsc.creaf.cat/map-mcscshp4.htm) y [leyenda MCSC-4](https://www.mcsc.creaf.cat/textos/LlegendaMCSC4_SIOSE2_CATALA.pdf), abiertas el 14 oct 2026
- Pruebas con `mcsc_lookup.py` sobre tres hojas, el 14 de octubre de 2026
