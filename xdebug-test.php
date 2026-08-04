<?php
// Arquivo de teste para Xdebug
function soma(int $x, int $y): int {
    $resultado = $x + $y; // breakpoint automático com Xdebug
    xdebug_break();
    return $resultado;
}

$valor = 10;
$mensagem = 'Teste de Xdebug';
$dados = ['a' => 1, 'b' => 2];

$total = soma($valor, 20);

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Teste Xdebug</title>
</head>
<body>
    <h1>Teste Xdebug</h1>
    <p>Valor inicial: <?php echo $valor; ?></p>
    <p>Mensagem: <?php echo htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8'); ?></p>
    <p>Total: <?php echo $total; ?></p>
    <pre><?php var_dump($dados); ?></pre>
</body>
</html>
