import React from "react";
import TabItem from "./TabItem";

class HostGroup extends React.Component<{ host: string, tabs: chrome.tabs.Tab[] }, {}> {
  constructor(props: { host: string; tabs: chrome.tabs.Tab[]; } | Readonly<{ host: string; tabs: chrome.tabs.Tab[]; }>) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
    const tabIds = this.props.tabs.map(tab => tab.id!);
    const group = await chrome.tabs.group({ tabIds });
    chrome.tabGroups.update(group, { title: this.props.host! });
  }

  render() {
    const listItems = this.props.tabs.map((tab: chrome.tabs.Tab) => <TabItem tab={tab} />)
    return (
      <a onClick={this.handleClick}>
        <h2 className="title">{this.props.host}</h2>
        <ul>
          {listItems}
        </ul>
      </a>
    );
  }
}

export default HostGroup;
