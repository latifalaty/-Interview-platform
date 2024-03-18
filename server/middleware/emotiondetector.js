const Emotion = require('../models/emotionSchema');

const saveEmotions = async (req, res) => {
    try {
        const emotionsData = req.body.emotions;
        const formattedEmotions = Object.keys(emotionsData[0]).map(emotion => ({
            emotion: emotion,
            percentage: emotionsData[0][emotion]
        }));
        const emotion = new Emotion({ emotions: formattedEmotions });
        await emotion.save();
        console.log('Emotions saved successfully:', formattedEmotions);
        res.status(200).send('Emotions saved successfully');
    } catch (error) {
        console.error('Error saving emotions:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = {
    saveEmotions
};