import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import validUrl = require("valid-url");

import {deleteLocalFiles, filterImageFromURL} from "./util/util";

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8084;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file
  app.get( "/filteredimage/", async ( req: Request, res: Response ) => {
    // Get the query string
    const imageUrl = req.query.image_url;

    // Validate the query string is provided and is a URL
    if ( !imageUrl || !validUrl.isUri(imageUrl) ) {
      res.status(400).send("You must provide a valid image URL");
    }

    // Download and filter image
    const newImage = await filterImageFromURL(imageUrl);
    if ( newImage === "error") {
      res.status(415).send("URL is not an image");
    } else {
      // return filtered image
      res.status(200).sendFile(
        newImage, () => {
          // delete temp file on the server on finish of the response
          deleteLocalFiles([newImage.toString()]);
        },
      );
    }

  } );

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}");
  } );

  // Start the Server
  app.listen( port, () => {
      // tslint:disable-next-line: no-console
      console.log( `server running http://localhost:${ port }` );
      // tslint:disable-next-line: no-console
      console.log( `press CTRL+C to stop server` );
  } );
})();
