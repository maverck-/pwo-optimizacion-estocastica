# Presentación de avance - contenido fuente

Duración objetivo: 12 a 15 minutos  
Audiencia: profesor y estudiantes de MII902  
Objetivo: demostrar cómo PWO asigna valores reales a las variables de decisión.

## Diapositiva 1 - Portada

### Título visible

**Painted Wolf Optimization**

Cómo las ecuaciones de movimiento asignan valores reales

Maverick Gayoso · Rogelio González  
MII902 Optimización Estocástica · 2026

### Trabajo narrativo

Abrir con la pregunta que organiza toda la exposición: qué valor recibe una
variable en la siguiente iteración.

### Fuente

Sheikhi (2026), DOI 10.32604/cmc.2026.077788.

---

## Diapositiva 2 - La metáfora termina donde comienza la variable

### Título visible

**Cada lobo es una solución; cada dimensión, una variable**

### Contenido visible

\[
\mathbf{X}_i(t)=
[X_{i,1}(t),X_{i,2}(t),\ldots,X_{i,d}(t)]
\]

- \(i\): solución o agente.
- \(j\): variable de decisión.
- \(t\): iteración.
- \(f(\mathbf{X}_i)\): calidad de la asignación.

### Mensaje central

PWO no mueve animales: transforma vectores reales y compara su fitness.

### Fuente

Sheikhi (2026), secciones 2.1 a 2.5.

---

## Diapositiva 3 - La primera asignación respeta el dominio

### Título visible

**La población parte con valores reales dentro de cada intervalo**

### Contenido visible

\[
X_{i,j}(0)=
lb_j+u_{i,j}(ub_j-lb_j),
\qquad u_{i,j}\sim U(0,1)
\]

Flujo:

1. generar \(N\) soluciones;
2. evaluar \(f(\mathbf{X}_i)\);
3. conservar la mejor como \(\mathbf{X}_{\alpha}\);
4. reparar por saturación si una variable sale del dominio.

### Mensaje central

La inicialización ya es una asignación completa de valores a todas las
variables.

### Fuente

Código oficial `Python/PWO.py` y `Matlab/PWO.m`.

---

## Diapositiva 4 - El rally elige la regla de movimiento

### Título visible

**Antes de mover, la población decide explorar o explotar**

### Contenido visible

1. \(a(t)=2(1-t/T)\)
2. \(L(t)=|0.04/a(t)|\)
3. cada agente cercano al alfa aporta 0.04
4. se compara fuerza \(R(t)\) con umbral \(H(t)\)

\[
R(t)<H(t)
\Rightarrow
\text{exploración}
\]

\[
R(t)\geq H(t)
\Rightarrow
\text{explotación}
\]

### Mensaje central

El rally no cambia variables directamente; selecciona la ecuación que las
cambiará.

### Fuente

Sheikhi (2026), ecuaciones 1 a 3.

---

## Diapositiva 5 - PWO dispone de tres asignaciones

### Título visible

**Una decisión global activa una de tres reglas**

### Contenido visible

**Exploración 1**  
Seguir una dimensión de un agente aleatorio.

**Exploración 2**  
Combinar alfa, media poblacional y distancia individual.

**Explotación**  
Actualizar cada dimensión con respecto al alfa.

### Mensaje central

Las tres ramas reciben la misma población, pero construyen
\(\mathbf{X}_i(t+1)\) con información distinta.

### Fuente

Sheikhi (2026), ecuaciones 4 a 9.

---

## Diapositiva 6 - Exploración 1

### Título visible

**Una dimensión aleatoria puede redefinir el vector completo**

### Contenido visible

\[
D_{i,j}^{rand}=
|(2Lr_1+r_2)X_{rand,j}-X_{i,j}|
\]

\[
\mathbf{X}_i(t+1)=
X_{rand,j}-(2ar_1-a)D_{i,j}^{rand}
\]

- se elige otro agente al azar;
- se calcula una distancia en la dimensión \(j\);
- el escalar resultante se asigna al vector completo.

### Mensaje central

Es una actualización escalar-a-vector y la rama más particular de PWO.

### Fuente

Sheikhi (2026), ecuaciones 4 y 5.

---

## Diapositiva 7 - Exploración 2

### Título visible

**La segunda exploración combina dirección global y distancia local**

### Contenido visible

\[
\mathbf{X}_i(t+1)=
(\mathbf{X}_{\alpha}-\overline{\mathbf{X}})
-
R|\mathbf{X}_{\alpha}-\mathbf{X}_i|
\]

**Dirección global**  
\(\mathbf{X}_{\alpha}-\overline{\mathbf{X}}\)

**Ajuste individual**  
\(R|\mathbf{X}_{\alpha}-\mathbf{X}_i|\)

### Mensaje central

La población se coordina alrededor del alfa sin perder la posición particular
de cada agente.

### Fuente

Sheikhi (2026), ecuación 6.

---

## Diapositiva 8 - Explotación

### Título visible

**La explotación asigna cada variable respecto del alfa**

### Contenido visible

\[
D_{i,j}^{\alpha}=
|X_{\alpha,j}-X_{i,j}|
\]

\[
A_2=R+a(2ar_1-a)L
\]

\[
X_{i,j}(t+1)=
X_{\alpha,j}-A_2D_{i,j}^{\alpha}
\]

### Mensaje central

Esta ecuación responde directamente qué valor recibe la variable \(j\) en la
siguiente iteración.

### Fuente

Sheikhi (2026), ecuaciones 7 a 9.

---

## Diapositiva 9 - Ruteo de una iteración

### Título visible

**Un movimiento de explotación mejora el fitness de 2.0201 a 1.9758**

### Contenido visible

Agente:

\[
\mathbf{X}_1(t)=(1.01,1.00)
\]

Alfa:

\[
\mathbf{X}_{\alpha}(t)=(1.00,0.99)
\]

Parámetros fijados:

\[
a=1.8,\quad L=0.022222,\quad R=0.08,\quad A_2=0.1088
\]

Resultado:

\[
\mathbf{X}_1(t+1)=(0.998912,0.988912)
\]

\[
f:\;2.0201\rightarrow1.975772
\]

### Mensaje central

La mejora surge de dos asignaciones escalares verificables, una por variable.

### Fuente

Cálculo propio reproducible a partir de las ecuaciones 7 a 9.

---

## Diapositiva 10 - Validación preliminar

### Título visible

**El código converge en Sphere; aún no reproduce el estudio completo**

### Contenido visible

Configuración:

- 20 agentes;
- 3 dimensiones;
- 100 iteraciones;
- dominio \([-100,100]^3\);
- semilla 20260728.

Resultado:

\[
4281.3964
\;\longrightarrow\;
2.5198\times10^{-92}
\]

### Mensaje central

La ejecución demuestra funcionamiento en un caso simple, no superioridad frente
a otros algoritmos.

### Fuente

Ejecución local de la implementación Python oficial.

---

## Diapositiva 11 - Reproducibilidad

### Título visible

**Paper, pseudocódigo y código no coinciden en todos los detalles**

### Contenido visible

1. el código usa un aleatorio adicional en el umbral;
2. Python no lleva \(a(t)\) exactamente a cero;
3. MATLAB puede dividir por cero en la última iteración;
4. la última población generada no se evalúa;
5. las ramas vectoriales se ejecutan dentro del ciclo de dimensiones.

Decisión de avance:

**paper como formulación; Python como referencia operacional.**

### Mensaje central

Las diferencias se documentan antes de modificar o binarizar el algoritmo.

### Fuente

Contraste propio entre paper, `Python/PWO.py` y `Matlab/PWO.m`.

---

## Diapositiva 12 - Cierre

### Título visible

**El avance deja una especificación continua lista para implementar**

### Contenido visible

Hoy:

- variables y notación definidas;
- tres movimientos explicados;
- ruteo verificable;
- código oficial ejecutado;
- diferencias registradas.

Siguiente:

1. estabilizar la implementación continua;
2. reproducir funciones benchmark;
3. definir binarización;
4. resolver un problema discreto.

### Mensaje central

Primero se fija cómo PWO asigna valores reales; después se transforma esa
dinámica al dominio binario.

### Fuente

Síntesis del avance y plan de trabajo del proyecto.

