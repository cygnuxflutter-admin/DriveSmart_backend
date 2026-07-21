import GoogleAd from '../model/googleAd.model.js';

const controller = {
  getGoogleAdIds: async (req, res) => {
    try {
      const googleAdIds = await GoogleAd.find().lean();
      return res.status(200).json({
        success: true,
        message: 'Google ad IDs fetched successfully',
        googleAdIds,
      });
    } catch (err) {
      console.error('Error fetching Google ad IDs:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  addGoogleAdIds: async (req, res) => {
    try {
      const { adName, adId, isAdShow } = req.body;
      if (!adName || !adId) {
        return res.status(400).json({ success: false, message: 'adName and adId are required' });
      }

      const existingAd = await GoogleAd.findOne({ adId });
      if (existingAd) {
        return res.status(400).json({ success: false, message: 'adId already exists' });
      }

      const newAd = new GoogleAd({
        adName,
        adId,
        isAdShow: isAdShow !== undefined ? isAdShow : true,
      });

      await newAd.save();

      return res.status(201).json({
        success: true,
        message: 'Google ad ID added successfully',
        googleAdId: { id: newAd.id, isShow: newAd.isAdShow },
      });
    } catch (err) {
      console.error('Error adding Google ad ID:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  editGoogleAdIds: async (req, res) => {
    try {
      const { id } = req.params;
      const { adName, adId, isAdShow } = req.body;

      const googleAd = await GoogleAd.findById(id);
      if (!googleAd) {
        return res.status(404).json({ success: false, message: 'Google ad ID not found' });
      }

      if (adName !== undefined) googleAd.adName = adName;
      if (adId !== undefined) googleAd.adId = adId;
      if (isAdShow !== undefined) googleAd.isAdShow = isAdShow;

      await googleAd.save();

      return res.status(200).json({
        success: true,
        message: 'Google ad ID updated successfully',
        googleAdId: { id: googleAd.id, isShow: googleAd.isAdShow },
      });
    } catch (err) {
      console.error('Error editing Google ad ID:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  deleteGoogleAdIds: async (req, res) => {
    try {
      const { id } = req.params;

      const googleAd = await GoogleAd.findByIdAndDelete(id);
      if (!googleAd) {
        return res.status(404).json({ success: false, message: 'Google ad ID not found' });
      }


      return res.status(200).json({
        success: true,
        message: 'Google ad ID deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting Google ad ID:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

};

export default controller;
