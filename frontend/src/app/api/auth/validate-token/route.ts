// // pages/api/auth/validate-token.ts
// import { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "GET") {
//     return res.status(405).end();
//   }

//   try {
//     const token = req.cookies.auth_token;
//     if (!token) {
//       return res.status(401).json({ error: "No token found" });
//     }

//     // Add any additional token validation logic here
//     return res.status(200).json({ token });
//   } catch (error) {
//     res.status(500).json({ error: "Token validation failed" });
//   }
// }
