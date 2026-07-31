# Plan de cierre de la entrega de avance

Plazo máximo: viernes 31 de julio de 2026 a las 19:00.

## Criterio de término

La entrega estará lista cuando el informe y la presentación expliquen la misma
versión del algoritmo, usen la misma notación y permitan seguir una asignación
numérica de las variables de decisión. El guion funciona como apoyo para
comprobar esa coherencia.

## Estado del contenido

- [x] Crear repositorio de trabajo separado del código oficial.
- [x] Copiar paper y antecedentes sin modificar los originales.
- [x] Preparar el informe de avance en Markdown.
- [x] Preparar la guía de contenido por láminas.
- [x] Preparar el guion de exposición.
- [x] Unificar la notación $i,j,t$.
- [x] Verificar el ruteo numérico.
- [x] Ejecutar una prueba reproducible en Python.
- [x] Registrar las diferencias entre paper, pseudocódigo y código.
- [x] Tratar el paper como formulación principal y Python como implementación
      observada.

## Contenido que debe conservarse

- [x] La metáfora del licaón ocupa como máximo una introducción breve.
- [x] Se explica que cada lobo es una solución y cada dimensión una variable.
- [x] Se muestra la inicialización dentro de $[lb_j,ub_j]$.
- [x] Se explica cómo el rally selecciona exploración o explotación.
- [x] Se muestran las dos estrategias de exploración.
- [x] Se muestra la actualización de explotación por dimensión.
- [x] Se explica la reparación mediante límites.
- [x] Se incluye un ruteo con números fijos.
- [x] Los resultados preliminares se identifican como prueba de funcionamiento,
      no como reproducción completa del estudio.
- [x] La binarización se presenta como trabajo futuro.
- [x] Se incluye declaración de uso de IA.

## Pendiente antes del envío

- [ ] Revisión final entre ambos autores.
- [ ] Construir la presentación a partir de la guía por láminas.
- [ ] Ensayar con cronómetro y ajustar el contenido a 15 minutos o menos.
- [ ] Decidir si la lámina sobre discrepancias queda en el cuerpo principal o
      como respaldo.
- [ ] Exportar el informe al formato final de entrega.
- [ ] Comprobar autores, asignatura, fórmulas y referencias.
- [ ] Abrir los archivos finales y verificar que no estén dañados.
- [ ] Preparar el correo con copia a todos.
- [ ] Enviar antes de las 18:00 para conservar una hora de margen.

## Ubicación de los archivos

Las fuentes editables permanecen en `docs/`. En `entregables/avance/` se
mantiene la copia del informe destinada al envío. La presentación definitiva
se agregará solo después de su preparación y revisión por ambos autores. El
guion permanece como documento de apoyo en `docs/presentacion/`.
