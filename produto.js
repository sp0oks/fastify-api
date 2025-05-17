class Produto {
    constructor(id, name, description, price, category, pictureUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.pictureUrl = pictureUrl;
    }
}

module.exports = Produto;