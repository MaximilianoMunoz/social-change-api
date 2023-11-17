import Passwordless from "supertokens-node/recipe/passwordless";
import Session from "supertokens-node/recipe/session";
import { TypeInput, AppInfo } from "supertokens-node/types";
import jwt from "jsonwebtoken";
import Dashboard from "supertokens-node/recipe/dashboard";
import {RecipeUserId} from "supertokens-node";
import {getSupabase} from "./utils/supabase";
import { SupertokensService } from "supertokens-node/recipe/passwordless/smsdelivery"

let supabase_signing_secret = process.env.SUPABASE_SIGNING_SECRET || "RQK5Nw8eW6ylYitnNJo7kGYkBR040TvzF+uQmZ7j4IFOUA0354BkwAIOViAoj5oEy23JwmBBDPel6ZZtomtnZA==";

export function getApiDomain() {
    const apiPort = process.env.REACT_APP_API_PORT || 3001;
    const apiUrl = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
    return apiUrl;
}

export function getWebsiteDomain() {
    const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3000;
    const websiteUrl = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;
    return websiteUrl;
}

export const SuperTokensConfig: TypeInput = {
    supertokens: {
        connectionURI: "https://st-prod-287c0250-858e-11ee-8cf3-5d664e22d3f6.aws.supertokens.io",
        apiKey: 'QqFKsR6j4SnXJtX0D7PPXnZMIH',
        // connectionURI: "https://try.supertokens.com",
    },
    appInfo: {
        appName: "Social Change",
        apiDomain: getApiDomain(),
        websiteDomain: getWebsiteDomain(),
    },
    // recipeList contains all the modules that you want to
    // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
    recipeList: [
        Passwordless.init({
            smsDelivery: {
                service: new SupertokensService("B3P6Z6e980ux0=uVynP4aPm41MehU=K8NVWfQ2HdTtjUMSJ0")
            },
            flowType: "USER_INPUT_CODE",
            contactMethod: "PHONE",
        }),
        Session.init({
            override: {
                functions: (originalImplementation)=>{
                    return{
                        ...originalImplementation,
                        createNewSession: async function (input) {
                            const payload = {
                                userId: input.userId,
                                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                            };

                            const supabase_jwt_token = jwt.sign(payload, supabase_signing_secret);

                            input.accessTokenPayload = {
                                ...input.accessTokenPayload,
                                supabase_token: supabase_jwt_token,
                            };

                            const responses = await originalImplementation.createNewSession(input);

                            const accessTokenPayload = responses.getAccessTokenPayload();

                            const supabase = getSupabase(accessTokenPayload.supabase_token);
                            
                            console.log({user_id: responses.getUserId()})
                            ;
                            const {error, data} = await supabase.from('user').insert({id: responses.getUserId()});

                            if (error!= null) {
                                console.log('error =>', error)
                                // throw new Error('error to create user')
                            } else {
                                // console.log({ session })
                                // console.log({ user })
                                console.log(data)
                            }
                            return responses;
                        },
                    }
                },
            }
        }),
        Dashboard.init(),
    ],
};
