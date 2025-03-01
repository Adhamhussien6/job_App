import {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLID,
  } from 'graphql';
import { approveCompany, banCompany, banuser,  getAllUsersAndCompanies, unbanCompany, unbanuser } from './resolve.js';
import { AllDataType, userType } from './types.js';
import { companyTypes } from '../../company/graphql/types.js';

export const adminQuery = {
    getAllUser: {
        type: AllDataType,
        args: {
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: getAllUsersAndCompanies
    }
  
}

export const adminmutation = {
    banuser: {
        type: GraphQLString,
        args: {
            authorization:{type:new GraphQLNonNull(GraphQLString)},
            userId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: banuser
    },
    unbanuser: {
        type: GraphQLString,
        args: {
            authorization:{type:new GraphQLNonNull(GraphQLString)},
            userId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: unbanuser
    },
    banCompany: {
        type: GraphQLString,
        args: {
            authorization:{type:new GraphQLNonNull(GraphQLString)},
            companyId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: banCompany
    },
   unbanCompany: {
        type: GraphQLString,
        args: {
            authorization:{type:new GraphQLNonNull(GraphQLString)},
            companyId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: unbanCompany
    },
    approveCompany: {
        type: GraphQLString,
        args: {
            authorization:{type:new GraphQLNonNull(GraphQLString)},
            companyId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: approveCompany
   }
    
}