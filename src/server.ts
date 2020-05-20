import express from 'express';
import bodyParser from 'body-parser';
import isurl from 'is-url';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () =>
{

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) =>
  {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // test image:  https://images.pexels.com/photos/264279/pexels-photo-264279.jpeg
  app.get("/filteredimage", async (req, res) =>
  {
    let { image_url } = req.query;

    // 1. validate the image_url query
    if (!image_url)
    {
      return res.status(400).send(`image_url is a required query param.  ex: GET /filteredimage?image_url=https://images.pexels.com/photos/264279/pexels-photo-264279.jpeg`);
    }

    // 1. validate image_url is a valid url
    if (!isurl(image_url))
    {
      return res.status(400).send(`image_url value (${image_url}) is not a valid URL.`);
    }

    try 
    {
      // 2. call filterImageFromURL(image_url) to filter the image
      const filteredImage = await filterImageFromURL(image_url);

      if (filteredImage === "error")
      {
        res.status(415).send('URL is not an Image');
      }
      else
      {
        // 3. send the resulting file in the response
        // 4. deletes any files on the server on finish of the response
        res.status(200).sendFile(filteredImage, () => deleteLocalFiles([filteredImage]));
      }
    }
    catch (error) 
    {
      res.status(422).send('Image could not be processed');
    }
  });



  // Start the Server
  app.listen(port, () =>
  {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();