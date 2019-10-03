import { SPHttpClient } from '@microsoft/sp-http'; 

export interface IAllEventsProps {
  description: string;
  siteurl:string;
  spHttpClient:SPHttpClient;
}
