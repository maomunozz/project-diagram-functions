import { getMaxListeners } from "cluster";

let db = {
  users: [
    {
      userId: "aIRypheM3YglYpdaw9yplfCrW9r2",
      email: "user13@email.com",
      createdAt: "2019-07-24T21:54:44.915Z",
      imageUrl: "image/algo/algo",
      firstName: "Mauricio",
      lastName: "Muñoz",
      profession: "Ingeniero de Sistemas"
    }
  ],
  projects: [
    {
      userId: "aIRypheM3YglYpdaw9yplfCrW9r2",
      title: "nuevo proyectos",
      description: "soy un nuevo proyecto",
      objective: "prueba",
      createAt: "2019-07-23T20:01:47.982Z",
      observers: ["123124657897987", "132132134546874"]
    }
  ],
  diagrams: [
    {
      projectId: "46548f4gsdf4g54sf8g",
      type: "object",
      diagram:
        '[{"id":"jxjjkik7","type":"Action","width":110,"height":40,"x":210,"y":200,"name":"😭","linksTo":[{"target":"jxjjkxpl","edited":false,"points":[{"x":265,"y":220},{"x":545,"y":220},{"x":545,"y":280}]}]},{"id":"jxjjkxpl","type":"Attribute","width":110,"height":80,"x":490,"y":280,"name":"hola","linksTo":[{"target":"jxjjloom","edited":false,"points":[{"x":545,"y":320},{"x":365,"y":320},{"x":365,"y":420}]},{"target":"jxjjqnnn","edited":false,"points":[{"x":545,"y":320},{"x":767.5,"y":320},{"x":767.5,"y":205}]},{"target":"jxjjqpbn","edited":false,"points":[{"x":545,"y":320},{"x":767.5,"y":320},{"x":767.5,"y":490}]}]},{"id":"jxjjloom","type":"Action","width":110,"height":40,"x":310,"y":420,"name":"💀"},{"id":"jxjjqnnn","type":"ObjectHardware","width":75,"height":75,"x":730,"y":130,"name":"hola"},{"id":"jxjjqpbn","type":"ObjectPassive","width":75,"height":75,"x":730,"y":490,"name":"hola"}]',
      createAt: "2019-07-24T21:54:44.915Z"
    }
  ],
  comments: [
    {
      userId: "aIRypheM3YglYpdaw9yplfCrW9r2",
      projectId: "Hw0oAK2plmfxBQ7eBDYu",
      body: "soy un comentario",
      userImage:
        "https://firebasestorage.googleapis.com/v0/b/diagram-project.appspot.com/o/no-image.png?alt=media",
      createAt: "2019-07-24T21:54:44.915Z"
    }
  ]
};

const userDetails = {
  //Redux
  credentials: {
    userId: "aIRypheM3YglYpdaw9yplfCrW9r2",
    firstName: "Mauricio",
    lastName: "Muñoz",
    profession: "Ingeniero de Sistemas",
    email: "user@gmail.com",
    createdAt: "2019-07-24T21:54:44.915Z",
    bio: "hola soy mauricio",
    profession: "Ingeniero",
    location: "Cali, Colombia",
    imageUrl: "image/adfadfadfadsf/adsfasdfas"
  }
};
