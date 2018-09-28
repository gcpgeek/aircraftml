'use strict';

const project = process.env.PROJECT
const region = process.env.REGION
const model = process.env.MODEL

const Automl = require('@google-cloud/automl');
const automl = new Automl.v1beta1.PredictionServiceClient({});

const modelPath = automl.modelPath(project, region, model);

exports.aircraftml = (request, response) => {
  console.log(request);
  response.set('Access-Control-Allow-Origin', '*' )
          .set('Access-Control-Allow-Methods', 'GET, POST');

  const image = request.body;
  var req = {
    name: modelPath,
    // inlude just the base64 bits, not the data:image/jpeg;base64 part
    payload: { "image": { "imageBytes": image.bytes.split(",").pop() }},
    params: { "score_threshold" : "0.0" }
  };
  automl.predict(req)
    .then(responses => {
      var predictions = [];
      responses[0].payload.forEach(function (it) { 
        predictions.push({ "aircraft" : it.displayName, "score" : it.classification.score}) 
      });
      // return a sortded list of predictions
      predictions.sort(function(a,b){return b.score-a.score})
      console.log(predictions)
      response.status(200).json(predictions)
    })
    .catch(error => {
      console.log(error)
      response.status(500);
    });
};

