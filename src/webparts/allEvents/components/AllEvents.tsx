import * as React from 'react';
import styles from './AllEvents.module.scss';
import { IAllEventsProps } from './IAllEventsProps';
import { IAllEventsState, CalendarInfo } from './IAllEventsState';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient, SPHttpClientResponse, SPHttpClientConfiguration } from '@microsoft/sp-http';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as moment from 'moment';
import Moment from 'react-moment';
import 'moment-timezone';

export default class AllEvents extends React.Component<IAllEventsProps, any> {

  public constructor(props: IAllEventsProps, state: IAllEventsState) {
    super(props);
    this.htmlBody = this.htmlBody.bind(this);
    this.htmlPanel = this.htmlPanel.bind(this);
    this._getEvents = this._getEvents.bind(this);
    this.handleChnage = this.handleChnage.bind(this);
    this.state = {
      items: [],
      options: []
    };
  }

  public componentDidMount() {
    SPComponentLoader.loadCss("/sites/common/SiteAssets/CustomShell/CSS/bootstrapV3.3.7.css");
    SPComponentLoader.loadCss("/sites/common/SiteAssets/CustomShell/CSS/bootstrap-custom.css");
    SPComponentLoader.loadCss("/sites/common/SiteAssets/CustomShell/CSS/incyte-custom-style.css");
    SPComponentLoader.loadCss("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");

    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this._getEvents(firstDay, lastDay);
  }

  public handleChnage(e) {
    //alert(e.target.value);
    var date = new Date(e.target.value);
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this._getEvents(firstDay, lastDay);
  }

  public _getEvents(firstDay, lastDay) {
    if (this.state.option === undefined) {
      var options = [];
      for (let index = 0; index < 6; index++) {
        var d = new Date();
        d.setMonth(d.getMonth() + index);
        options.push(moment(d.toLocaleDateString()).format("MMM YYYY"));
      }
    }
    var filter = "&$filter=(EventDate ge '" + firstDay.toISOString() + "')and (EndDate le '" + lastDay.toISOString() + "')&$orderby=EventDate asc&$top=5";
    const restFullURL = this.props.siteurl + "/_api/lists/GetByTitle('Calendar')/items?select=ID,Title,Location,EventDate,EndDate" + filter;
    console.log(restFullURL);
    this.props.spHttpClient.get(restFullURL, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        response.json().then((responseJSON: any) => {
          console.log(responseJSON);
          if (this.state.option === undefined) {
            this.setState({
              items: responseJSON.value,
              options: options
            });
          } else {
            this.setState({
              items: responseJSON.value,
            });
          }

          console.log(this.state);
        });
      });
  }

  public htmlPanel() {
    var bdy;
    if (this.state.items === undefined) {
      var gif = <div className={styles.allEvents}>
        <img className="img-responsive" src={this.props.siteurl + "/SiteAssets/All-Events/loading.gif"} />
      </div>;
      return gif;
    } else {
      if (this.state.items.length === 0) {
        bdy = <div className="row-fluid">
          <div className="alert alert-danger">
            <strong><i className="fa fa-exclamation-triangle" aria-hidden="true"> </i> Note: </strong>
            There is no events on selected date.
          </div>
        </div>;

      }
      else {
        bdy = this.htmlBody();
      }
      var pnl = <div className={styles.allEvents}>
        <div className={`${styles.borderRow} row`}>
          <div className={`${styles.panelUpdate} panel panel-primary`}>
            <div className="panel-heading">
              <div className="row">
                <div className="col-sm-7">
                  <h3 className={styles.mainTitle}><i className="fa fa-calendar" aria-hidden="true"> </i> All Events</h3>
                </div>
                <div className="col-sm-offset-2 col-sm-3">
                  <select className={`${styles.monthdd} row form-control pull-right`} onChange={this.handleChnage}>
                    {this.state.options.map((e, key) => {
                      return <option key={key} value={e}>{e}</option>;
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            <div className="row-fluid">
              {bdy}
            </div>
          </div>
        </div>
      </div>;
      return pnl;
    }
  }

  public htmlBody() {
    var bdy = <div>{
      this.state.items.map(item =>
        <div className={`${styles.rowSpan} row`}>
          <div className="col-sm-2">
            <b className={`${styles.calendarIcon} fa-stack fa-2x`}>
              <i className="fa fa-calendar-o fa-stack-2x"></i>
              <i className={`${styles.month} fa-stack-1x calendar-text`}>
                <Moment format="MMM">{item.EventDate}</Moment>
              </i>
              <i className={`${styles.day} fa-stack-1x calendar-text `}>
                <Moment format="DD">{item.EventDate}</Moment>
              </i>
            </b>
          </div>
          <div className="col-sm-10">
            <div className="row">
              <p className={styles.eventsDate}>
                <Moment format="MMMM Do YYYY">{item.EventDate}</Moment>, <Moment format="h A">{item.EventDate}</Moment> to <Moment format="h A">{item.EndDate}</Moment>
              </p>
            </div>
            <div className="row">
              <h4 className={styles.eventsSubTitle}>
                {item.Title}  &nbsp;
                <a target="_blank" href={this.props.siteurl +"/pages/Events.aspx?ID='".concat(item.ID,"'")}>
                  | Enroll
                </a>
              </h4>
            </div>
          </div>
        </div>
      )
    }
    </div>;
    return bdy;
  }

  public render(): React.ReactElement<IAllEventsProps> {
    var finalDom = this.htmlPanel();
    return (
      <div className={styles.allEvents}>
        {finalDom}
      </div>

    );
  }
}

{/* <div className={styles.allEvents}>
<div className="row">
  <h3 className={styles.title}>
    <a target="_blank" href="/sites/ratnadev/pages/AllEvents.aspx">
      Events
    </a>
  </h3>
</div>
{
  this.state.items.map(item =>
    <div className={`${styles.rowSpan} row`}>
      <div className="col-sm-2">
        <b className={`${styles.calendarIcon} fa-stack fa-2x`}>
          <i className="fa fa-calendar-o fa-stack-2x"></i>
          <i className={`${styles.month} fa-stack-1x calendar-text`}>
            <Moment format="MMM">{item.EventDate}</Moment>
          </i>
          <i className={`${styles.day} fa-stack-1x calendar-text `}>
            <Moment format="DD">{item.EventDate}</Moment>
          </i>
        </b>
      </div>
      <div className="col-sm-10">
        <div className="row">
          <p className={styles.eventsDate}>
            <Moment format="MMMM Do YYYY">{item.EventDate}</Moment>, <Moment format="h A">{item.EventDate}</Moment> to <Moment format="h A">{item.EndDate}</Moment>
          </p>
        </div>
        <div className="row">
          <h4 className={styles.eventsSubTitle}>
            {item.Title}  &nbsp;
            <a target="_blank" href={"/sites/ratnadev/pages/Events.aspx?ID=".concat(item.ID)}>
              | Enroll
            </a>
          </h4>
        </div>
      </div>
    </div>
  )
}
<div className="row">
  <div className="col-sm-offset-2 col-sm-10">
    <h3 className={styles.moreEvents}>
      <a target="_blank" href="/sites/ratnadev/pages/AllEvents.aspx">
        More Events ...
    </a>
    </h3>
  </div>
</div>
</div> */}
