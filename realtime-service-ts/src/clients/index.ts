import {MessengerClient} from "./messageClient.js";
import {UserServiceClient} from "./userServiceClient.js";

export const userServiceClient = new UserServiceClient();
export const messageClient = new MessengerClient();