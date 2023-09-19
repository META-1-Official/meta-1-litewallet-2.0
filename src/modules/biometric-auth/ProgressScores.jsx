import React from 'react';
import TaskStats from './TaskStats';

export default class ProgressScores extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextProps.logs.length) return false;
    const latestLog = nextProps.logs[nextProps.logs.length - 1];
    if (
      typeof latestLog.msg.type !== 'undefined' &&
      latestLog.msg.type === 'data'
    ) {
      this.log = latestLog.msg;
      return true;
    }

    return false;
  }

  render() {
    return (
      this.log && (
        <div>
          <div style={{ minHeight: '180px', textAlign: 'left' }}>
            {/*<div>*/}
            {/*    <p>TaskStats</p>*/}
            {/*</div>*/}
            <TaskStats data={this.log.message} />
          </div>
        </div>
      )
    );
  }
}
