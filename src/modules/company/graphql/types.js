import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { userType } from "../../user/graphql/types.js";


export const companyTypes = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLID },
        comapnyName: { type: GraphQLString },
        description: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: GraphQLString },
        numberOfEmployees: { type: GraphQLInt },
        companyEmail:{type:GraphQLString},  
  
       
    })
 });


