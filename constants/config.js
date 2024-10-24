const corsOptions = {
    origin: [
      "http://localhost:3001",
      process.env.CLIENT_URL,
      
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: false,
  };
  
  const CHATTU_TOKEN = "chattu-token";
  
  export { corsOptions, CHATTU_TOKEN};
