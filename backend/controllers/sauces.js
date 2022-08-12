const Sauce = require('../models/sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => {
            res.status(200).json(sauces);
        })
        .catch((error) => {
            res.status(400).json({
                error: error
            });
        });
}

exports.createSauce = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    req.body.sauce = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        userId: req.body.sauce.userId,
        name: req.body.sauce.name,
        manufacturer: req.body.sauce.manufacturer,
        description: req.body.sauce.description,
        mainPepper: req.body.sauce.mainPepper,
        imageUrl: url + '/images/' + req.file.filename,
        heat: req.body.sauce.heat,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce.save()
        .then(() => {
            res.status(201).json({
                message: 'Post saved successfully.'
            });
        })
        .catch((error) => {
            res.status(400).json({
                error: error
            });
        });
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    })
        .then((sauce) => {
            res.status(200).json(sauce);
        })
        .catch((error) => {
            res.status(404).json({
                error: error
            });
        });
}

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
        let sauceLikes = sauce.likes;
        let sauceDislikes = sauce.dislikes;
        let sauceUsersLiked = sauce.usersLiked;
        let sauceUsersDisliked = sauce.usersDisliked;
        let user = req.body.userId;
        let sauceUpdate = new Sauce({ _id: req.params.id });
        if (req.body.like === 1) {
            sauceLikes += 1;
            sauceUpdate.likes = sauceLikes;
            sauceUsersLiked.push(user);
            sauceUpdate.usersLiked = sauceUsersLiked;
        } else if (req.body.like === -1) {
            sauceDislikes += 1;
            sauceUpdate.dislikes = sauceDislikes;
            sauceUsersDisliked.push(user);
            sauceUpdate.usersDisliked = sauceUsersDisliked;
        } else if (req.body.like === 0) {
            let indexLikes = sauceUsersLiked.indexOf(user);
            let indexDislikes = sauceUsersDisliked.indexOf(user);
            if (indexLikes > -1) {
                sauceUsersLiked.splice(indexLikes, 1);
                sauceUpdate.usersLiked = sauceUsersLiked;
                sauceLikes -= 1;
                sauceUpdate.likes = sauceLikes;
            } else if (indexDislikes > -1) {
                sauceUsersDisliked.splice(indexDislikes, 1);
                sauceUpdate.usersDisliked = sauceUsersDisliked;
                sauceDislikes -= 1;
                sauceUpdate.dislikes = sauceDislikes;
        }
        }
        Sauce.updateOne({ _id: req.params.id }, sauceUpdate)
            .then(() => {
                res.status(201).json({
                    message: 'Sauce updated successfully.'
                });
            })
            .catch((error) => {
                res.status(400).json({
                    error: error
                });
            });
        })
    .catch((error) => {
        res.status(400).json({
            error: error
        });
    });
}

exports.modifySauce = (req, res, next) => {
    let sauce = new Sauce({ _id: req.params.id });
    if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        req.body.sauce = JSON.parse(req.body.sauce);
        sauce = {
            _id: req.params.id,
            userId: req.body.sauce.userId,
            name: req.body.sauce.name,
            manufacturer: req.body.sauce.manufacturer,
            description: req.body.sauce.description,
            mainPepper: req.body.sauce.mainPepper,
            imageUrl: url + '/images/' + req.file.filename,
            heat: req.body.sauce.heat,
            /* likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: [], */
        };
    } else {
        sauce ={
            _id: req.params.id,
            userId: req.body.userId,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            imageUrl: req.body.imageUrl,
            heat: req.body.heat,
        };
    }
    Sauce.updateOne({
        _id: req.params.id
    }, sauce)
        .then(() => {
            res.status(201).json({
                message: 'Sauce updated successfully.'
            });
        })
        .catch((error) => {
            res.status(400).json({
                error: error
            });
        });
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    })
        .then((sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + filename, () => {
                Sauce.deleteOne({
                    _id: req.params.id
                })
                    .then(() => {
                        res.status(200).json({
                            message: 'Deleted!'
                        });
                    }) .catch((error) => {
                        res.status(400).json({
                            error: error
                        });
                    });
                });
        });
}