/**
 * It calculates the distance between two points on the Earth's surface, given their latitude and
 * longitude.
 * @param lat1 - Latitude of the first point
 * @param lon1 - longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lon2 - longitude of the second point
 * @param unit - The unit you desire for results.
 * @returns The distance between two points in kilometers.
 */
function distance(lat1, lon1, lat2, lon2, unit) {
    if (lat1 == lat2 && lon1 == lon2) {
        return 0;
    } else {
        var radlat1 = (Math.PI * lat1) / 180;
        var radlat2 = (Math.PI * lat2) / 180;
        var theta = lon1 - lon2;
        var radtheta = (Math.PI * theta) / 180;
        var dist =
            Math.sin(radlat1) * Math.sin(radlat2) +
            Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = (dist * 180) / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") {
            dist = dist * 1.609344;
        }
        return dist;
    }
}
/**
 * It takes the latitude and longitude of the user and returns the nearest boutiques to the user.
 * </code>
 * @param req - is the request object
 * @param res - the response object
 * @param next - The next middleware function in the stack.
 * @returns An array of objects with the boutique_id and distance.
 */

export default async function boutiquesNear({ models }, req, res, next) {
    try {
        /* Destructuring the req.query object. */
        let { latitude, longitude, limit } = req.query;
        /* Checking if the latitude, longitude and limit are not null. If they are null, it throws an
      error. */
        if (!latitude || !longitude || !limit)
            throw new Error("Invalid input, Missing parameters");

        const Boutique = models.boutique;
        longitude = parseInt(latitude);
        latitude = parseInt(longitude);
        let nearest = [];
        let boutiques = await Boutique.find({});
        /* Iterating through the boutiques array and calculating the distance between the user and the
    boutique. */
        for (var i = 0; i < boutiques.length; i++) {
            let distances = distance(
                latitude,
                longitude,
                boutiques[i].location.lat,
                boutiques[i].location.lon,
                "K"
            );
            nearest.push({
                boutique_id: boutiques[i]._id,
                distance: distances,
            });
        }
        /* Sorting the nearest array by the distance and then splicing it to the limit. */
        nearest = nearest
            .sort(function (a, b) {
                return a.distance - b.distance;
            })
            .splice(0, limit);
        /* Sending the nearest array to the user. */
        res.status(200).send({
            nearest: nearest || [],
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}
