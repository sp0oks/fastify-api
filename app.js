const fs = require('fs').promises;
const path = require('path');
const Produto = require('./Produto');




async function lerProdutos() {
    try {
        const filePath = path.join(__dirname, 'products.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const produtosJson = JSON.parse(data);

        // Transforma objetos JSON em instâncias da classe Produto
        const produtos = produtosJson.map(produto =>
            new Produto(
                produto.id,
                produto.name,
                produto.description,
                produto.price,
                produto.category,
                produto.pictureUrl
            )
        );

        return produtos;
    } catch (error) {
        console.error('Erro ao ler o arquivo:', error);
    }
}

// Função para checar se a categoria é permitida usando a API
async function conferirPermissaoCategoria(categoria) {
    try {
        const response = await fetch(`https://posdesweb.igormaldonado.com.br/api/allowedCategory?category=${encodeURIComponent(categoria)}`);
        const data = await response.json();
        return data.allowed; // true ou false
    } catch (error) {
        console.error('Erro ao verificar categoria:', error);
        return false; // Se erro, assume que não é permitido
    }
}

lerProdutos()
    .then(async (produtos) => {
        const produtosFiltrados = [];

        for (const produto of produtos) {
            const permitido = await conferirPermissaoCategoria(produto.category);

            if (permitido) {
                produtosFiltrados.push(produto);
            }
        }

        console.log('Produtos permitidos:');
        console.log(produtosFiltrados)

        // Preparar os dados só com id e name
        const dadosParaSalvar = produtosFiltrados.map(p => ({
            id: p.id,
            name: p.name
        }));

        // Caminho para salvar o processed.json
        const outputPath = path.join(__dirname, 'processed.json');

        // Salvar o arquivo
        await fs.writeFile(outputPath, JSON.stringify(dadosParaSalvar, null, 2), 'utf-8');

        console.log('Arquivo processed.json criado com sucesso!');

    })
    .catch(error => {
        console.error('Erro:', error);
    });