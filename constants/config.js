const corsOptions = {
    origin: [
      "http://localhost:3001",
      "https://ifms-five.vercel.app",
      process.env.CLIENT_URL,
      
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: false,
  };
  
  const CHATTU_TOKEN = "chattu-token";
  
  export { corsOptions, CHATTU_TOKEN};
