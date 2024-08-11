# nestjs-social-auth-refresh

This repository is use nestjs with passport to implementation Oauth2 with google auth

## dependency

1. orm: @nestjs/mongoose, mongoose
2. config: @nestjs/config
3. dto validator: class-validator, class-transformer
4. hash : bcrypt
5. authentication: @nestjs/passport passport passport-local passport-jwt @nestjs/jwt, cookie-parser

## step to build

1. JWT module

2. OAuth module


## step 1: persisten user session in mongodb

setup scheam with user info

setup route with create user

setup service with create user

## step 1.5: setup authentication

setup handler to verify credentials

setup decorator to extract verified data from context

## step 2: setup jwt verify


## step 3: refresh token

https://www.youtube.com/watch?v=S8Cjx5ua2JU