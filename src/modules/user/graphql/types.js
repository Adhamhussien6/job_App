import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { companyTypes } from "../../company/graphql/types.js";


export const userType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        provider: { type: GraphQLString },
        gender: { type: GraphQLString },
        mobileNumber:{type:GraphQLString},  
       
       
    })
});


export const AllDataType = new GraphQLObjectType({
    name: "AllData",
    fields: {
        users: { type: new GraphQLList(userType) },
        company: { type: new GraphQLList(companyTypes) }
    }
});

 