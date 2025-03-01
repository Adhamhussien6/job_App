import {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
  } from 'graphql';
import { adminmutation, adminQuery } from './user/graphql/fields.js';


export   const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "query",
      fields: {
         ...adminQuery
      }
    }),
    mutation: new GraphQLObjectType({
        name: "mutation",
        fields: {
           ...adminmutation
        }
      }),
    })
