%% Painted Wolf Optimization: prueba interactiva del repositorio oficial
% Este script ejecuta la implementación MATLAB del autor sin modificarla.
% Los marcadores %% permiten ejecutar una sección a la vez desde MATLAB.
% También puede guardarse como MATLAB Live Script (.mlx).

clear;
clc;
close all;

%% 1. Localizar y agregar el código oficial al path
script_dir = fileparts(mfilename('fullpath'));
project_repo = fileparts(fileparts(script_dir));
umbrella_dir = fileparts(project_repo);
official_matlab_dir = fullfile(umbrella_dir, ...
    'Painted-Wolf-Optimization', 'Matlab');
official_pwo = fullfile(official_matlab_dir, 'PWO.m');

assert(exist(official_pwo, 'file') == 2, ...
    'No se encontró PWO.m en: %s', official_pwo);

addpath(official_matlab_dir);
path_cleanup = onCleanup(@() rmpath(official_matlab_dir));

fprintf('Implementación oficial: %s\n', official_pwo);

%% 2. Definir la prueba Sphere
% La semilla controla la ejecución MATLAB. MATLAB y NumPy utilizan generadores
% distintos, por lo que una misma semilla no produce la misma trayectoria.

seed = 20260728;
SearchAgents_no = 20;
Max_iteration = 100;
dim = 3;
lb = -100;
ub = 100;
fobj = @(x) sum(x.^2);

rng(seed, 'twister');

%% 3. Ejecutar PWO
[Best_score, Best_pos, PWO_cg_curve] = PWO( ...
    SearchAgents_no, Max_iteration, lb, ub, dim, fobj);

fprintf('\n--- Resultado Sphere ---\n');
fprintf('Semilla: %d\n', seed);
fprintf('Mejor fitness: %.12e\n', Best_score);
fprintf('Mejor posición:\n');
disp(Best_pos);

%% 4. Comprobar consistencia
assert(numel(PWO_cg_curve) == Max_iteration, ...
    'La curva no tiene una entrada por iteración.');
assert(all(isfinite(PWO_cg_curve)), ...
    'La curva contiene valores no finitos.');
assert(all(diff(PWO_cg_curve) <= 0), ...
    'El mejor fitness histórico aumentó.');
assert(all(Best_pos >= lb) && all(Best_pos <= ub), ...
    'La mejor posición está fuera del dominio.');
assert(abs(fobj(Best_pos) - Best_score) <= ...
    max(1, abs(Best_score)) * 1e-10, ...
    'El fitness de Best_pos no coincide con Best_score.');

fprintf('Todas las comprobaciones básicas: OK\n');

%% 5. Visualizar convergencia
safe_curve = max(PWO_cg_curve, realmin);

figure('Name', 'PWO - Sphere', 'Color', 'w');
semilogy(1:Max_iteration, safe_curve, ...
    'Color', [0.03 0.49 0.55], 'LineWidth', 2);
grid on;
box on;
xlabel('Iteración');
ylabel('Mejor fitness');
title('Convergencia PWO sobre Sphere');

%% 6. Reproducir el ruteo de explotación
agent = [1.01, 1.00];
alpha = [1.00, 0.99];
a = 1.8;
Alpha_influence = 0.04 / a;
rally_strength = 0.08;
r1 = 0.7;

A1 = 2 * a * r1 - a;
A2 = rally_strength + a * A1 * Alpha_influence;
D_alpha = abs(alpha - agent);
updated_agent = alpha - A2 .* D_alpha;

fprintf('\n--- Ruteo de explotación ---\n');
fprintf('A1 = %.6f\n', A1);
fprintf('A2 = %.6f\n', A2);
fprintf('Antes:  [%.6f, %.6f]\n', agent(1), agent(2));
fprintf('Después:[%.6f, %.6f]\n', ...
    updated_agent(1), updated_agent(2));
fprintf('Fitness antes:   %.12f\n', fobj(agent));
fprintf('Fitness después: %.12f\n', fobj(updated_agent));

assert(all(abs(updated_agent - [0.998912, 0.988912]) < 1e-12), ...
    'El ruteo no coincide con el cálculo esperado.');

%% 7. Repetir con varias semillas
trial_seeds = [20260728, 20260729, 20260730];
trial_scores = zeros(size(trial_seeds));

for k = 1:numel(trial_seeds)
    rng(trial_seeds(k), 'twister');
    run_log = evalc( ...
        '[score, ~, ~] = PWO(SearchAgents_no, Max_iteration, lb, ub, dim, fobj);');
    trial_scores(k) = score;
end

results = table(trial_seeds(:), trial_scores(:), ...
    'VariableNames', {'Seed', 'BestScore'});
disp(results);

fprintf('Mínimo:  %.6e\n', min(trial_scores));
fprintf('Mediana: %.6e\n', median(trial_scores));
fprintf('Máximo:  %.6e\n', max(trial_scores));

%% 8. Siguiente prueba: Rastrigin
% Descomenta este bloque para cambiar la función objetivo.
%
% rastrigin = @(x) 10 * numel(x) + ...
%     sum(x.^2 - 10 * cos(2 * pi * x));
% rng(20260728, 'twister');
% [score_rastrigin, pos_rastrigin, curve_rastrigin] = PWO( ...
%     20, 100, -5.12, 5.12, 3, rastrigin);
% fprintf('Mejor fitness Rastrigin: %.12e\n', score_rastrigin);
% disp(pos_rastrigin);
