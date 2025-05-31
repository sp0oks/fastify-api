class Produto {
    constructor(id, externalId, name, description, price, category, pictureUrl) {
        this.id = id;
        this.externalId = externalId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.pictureUrl = pictureUrl;
    }
}

module.exports = Produto;