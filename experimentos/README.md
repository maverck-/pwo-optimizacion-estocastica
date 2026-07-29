# Experimentos

Cada experimento debe registrar:

- función objetivo;
- dimensión y dominio;
- tamaño de población;
- número de iteraciones;
- semilla;
- versión del algoritmo;
- fecha de ejecución;
- mejor posición y fitness;
- curva de convergencia;
- observaciones de factibilidad o reparación.

Los resultados del avance son pruebas preliminares de funcionamiento. La
comparación experimental completa se reserva para el informe final.

## Vía recomendada de interacción

### Python: JupyterLab

Es la vía principal para explorar PWO porque permite cambiar parámetros,
ejecutar por etapas, conservar resultados y agregar instrumentación sin
modificar el código oficial.

Desde la raíz de `pwo-optimizacion-estocastica`:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r experimentos/requirements-python.txt
jupyter lab experimentos/notebooks/pwo_prueba_repo.ipynb
```

El notebook localiza automáticamente el repositorio oficial hermano e importa:

```text
../Painted-Wolf-Optimization/Python/PWO.py
```

Incluye una prueba Sphere reproducible, comprobaciones automáticas, curva de
convergencia, ruteo de explotación y comparación de tres semillas.

### MATLAB: script por secciones

Abre:

```text
experimentos/matlab/pwo_prueba_interactiva.m
```

Los encabezados `%%` permiten usar **Run Section** en MATLAB. Este formato es
texto versionable y resulta más fácil de revisar que un archivo binario
`.mlx`. Si prefieres Live Script, usa **Save As → MATLAB Live Script (`.mlx`)**.

El script agrega temporalmente al path:

```text
../Painted-Wolf-Optimization/Matlab
```

y ejecuta la implementación oficial, comprobaciones, gráfica, ruteo y tres
semillas.

El script MATLAB fue revisado contra la interfaz de `PWO.m`, pero no se ejecutó
en esta preparación porque MATLAB u Octave no están instalados en el entorno
local. La primera ejecución debe hacerse desde MATLAB con **Run Section**.

## Qué herramienta usar

- **Python/Jupyter:** desarrollo cotidiano, instrumentación y futuros
  experimentos comparativos.
- **MATLAB por secciones:** contraste con la segunda implementación oficial y
  acceso a las funciones benchmark `F1` a `F23`.
- **Ambos:** verificación de lógica y tendencias. No se deben esperar
  trayectorias numéricas idénticas, porque NumPy y MATLAB usan generadores
  aleatorios diferentes.

## Precaución conocida

La versión MATLAB calcula `a = 0` en la última iteración, mientras Python no
llega exactamente a cero. Esta diferencia ya está documentada en el informe y
debe conservarse como decisión de reproducibilidad antes de modificar el
algoritmo.
