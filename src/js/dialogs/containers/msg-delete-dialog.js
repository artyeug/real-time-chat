import React from 'react';
import autobind from 'autobind-decorator';
import MsgDeleteDialog from '../components/msg-delete-dialog';
import { DIALOG_BUTTONS } from '../../auxiliary/button-names';

@autobind
export default class MsgDeleteDialogContainer extends React.Component {
  handleClick(event) {
    switch (event.target.name) {
      case DIALOG_BUTTONS.CLOSE:
      case DIALOG_BUTTONS.NO:
        this.props.handleDialogClose();
        break;
      case DIALOG_BUTTONS.YES:
        this.props.handleDeleteAccept();
        break;
    }
  }

  render() {
    return (
      <MsgDeleteDialog
        handleClick={this.handleClick}
      />
    );
  }
}
