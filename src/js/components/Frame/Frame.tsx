import * as React from 'react';

import Modal from 'components/Modal';
import Loading from 'components/Loading';


interface IFrameProps {
  onComplete: () => void;
  onClose: () => void;
  url: string;
}

export default class Frame extends React.Component<IFrameProps> {
  state = {
    isLoaded: false,
  };

  check = async (ignoreError = true) => {
    const { onComplete, onClose } = this.props;

    if (this.state.isLoaded) {
      try {

      } catch (error) {
        if (!ignoreError) {
          return;
        }
      }
    }

    onClose();
  }

  getPostMessage = async (message: any) =>
    console.log(message);

  componentDidMount() {
    window.addEventListener('message', this.getPostMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.getPostMessage);
  }

  render () {
    return (
      <Modal onClose={this.check} noPad>
        <div className='frame'>
          <iframe
            src={this.props.url}
            frameBorder='0'
            onLoad={() => this.setState({ isLoaded: true })}
          />
          {!this.state.isLoaded && <Loading />}
        </div>
      </Modal>
    );
  }
}
