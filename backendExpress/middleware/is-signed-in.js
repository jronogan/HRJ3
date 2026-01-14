import express from "express";
import jwt from "jsonwebtoken";

export const isSignedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);
  req.decoded = decoded;
  next();
};
