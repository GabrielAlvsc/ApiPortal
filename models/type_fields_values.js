module.exports = (app) => {
    const types = {
        SHORT_TEXT: {
            "id": 1,
            "name": "Texto curto",
            "tag": "text",
        },
        LONT_TEXT: {
            "id": 2,
            "name": "Texto longo",
            "tag": "longtext",
        }, IMAGE: {
            "id": 3,
            "name": "Imagem",
            "tag": "image",
        }, SCRIPT: {
            "id": 4,
            "name": "Script",
            "tag": "script",
        }, FEATURE: {
            "id": 5,
            "name": "Caracteristica",
            "tag": "text",
        }
    }

    return types;

}