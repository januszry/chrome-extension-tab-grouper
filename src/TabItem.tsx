import React from "react";

class TabItem extends React.Component<{ tab: chrome.tabs.Tab }, {}> {
  constructor(props: { tab: chrome.tabs.Tab; } | Readonly<{ tab: chrome.tabs.Tab; }>) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    await chrome.tabs.update(this.props.tab.id!, { active: true });
    await chrome.windows.update(this.props.tab.windowId, { focused: true });
  }

  render() {
    const url = new URL(this.props.tab.url!);
    return (
      <li>
        <a onClick={this.handleClick}>
          <h3 className="title">{this.props.tab.title}</h3>
          <p className="pathname">{url.pathname}</p>
        </a>
      </li>);
  }
}

export default TabItem;
