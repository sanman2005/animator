import * as React from 'react';
import * as ReactDOM from 'react-dom';
import cn from 'classnames';
import Icons from '../icons';
import { getElementOffsetLeft, isClient } from '../../helpers';

// tslint:disable-next-line:variable-name
const Player = isClient && require('react-plyr').default;

if (isClient && !(window as any)._classCallCheck) { // костыль для plyr
  (window as any)._classCallCheck = function (instance: any, constructor: any) {
    if (!(instance instanceof constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  };
}

interface IVideoMark {
  timeStart: number;
  text: string;
}

interface IVideoProps {
  autoPlay?: boolean;
  duration?: number;
  marks?: IVideoMark[];
  onProgress?(time: number): void;
  onEnd?(): void;
  playButtonSize?: 'big' | 'small';
  preview?: string;
  startTime?: number;
  url: string;
  muted?: boolean;
}

interface IVideoState {
  quality: string;
  isStarted: boolean;
  isPlaying: boolean;
  isFullScreen: boolean;
}

class Video extends React.Component<IVideoProps, IVideoState> {
  static defaultProps = {
    playButtonSize: 'big',
  };

  state = {
    quality: 'Auto',
    isStarted: !!this.props.autoPlay,
    isPlaying: false,
    isFullScreen: false,
  };
  marksContainer: Element = null;
  marksInterval: NodeJS.Timeout = null;
  player: any = null;
  progress = 0;
  qualityMenu: Element = null;
  ref = React.createRef();
  startProgress = this.props.startTime || 0;
  startFullScreen = false;
  videoRatio: number[] = null;

  start = () => this.setState({ isStarted: true });

  renderMark = (mark: IVideoMark, index: number, duration: number) => (
    <div
      key={index}
      className='video__mark'
      style={{ left: `${mark.timeStart * 100 / duration}%` }} />
  )

  addMarks(duration: number) {
    if (!isClient) {
      return;
    }

    const { marks } = this.props;
    const marksSorted = marks.sort(
      (mark1, mark2) => mark1.timeStart < mark2.timeStart ? -1 : 1,
    );
    const marksElements: JSX.Element[] = marksSorted.map(
      (mark, index) => this.renderMark(mark, index, duration),
    );
    const progress = this.player.elements.progress;
    const tooltip = progress.querySelector('.plyr__tooltip');
    const marksOffsets = marksSorted.map(
      mark => mark.timeStart / duration,
    );

    this.marksContainer = document.createElement('div');
    progress.appendChild(this.marksContainer);
    ReactDOM.render(marksElements, this.marksContainer);

    let progressWidth = progress.offsetWidth;
    let progressLeft = getElementOffsetLeft(progress);
    let activeMark: IVideoMark = null;

    progress.addEventListener('mouseenter', () => {
      progressWidth = progress.offsetWidth;
      progressLeft = getElementOffsetLeft(progress);
    });

    progress.addEventListener('mousemove', (event: any) => {
      const x = event.clientX || event.pageX;
      const offset = (x - progressLeft) / progressWidth;

      activeMark = null;

      for (let i = marksOffsets.length - 1; i >= 0; i--) {
        if (offset >= marksOffsets[i]) {
          activeMark = marks[i];
          break;
        }
      }

      const tooltipText = tooltip.innerHTML.replace(/.*\>/, '');
      const markText = activeMark
        ? `<span class='video__mark-text'>${activeMark.text}</span>`
        : '';

      tooltip.innerHTML = `${markText}${tooltipText}`;
    });
  }

  addQuality() {
    const { settings } = this.player.elements;
    const button: Element = settings.buttons.quality;
    const label: Element = button.querySelector('.plyr__menu__value');
    const { quality } = this.state;

    this.qualityMenu = settings.panels.quality.querySelector('[role=menu]');
    button.removeAttribute('hidden');
    label.innerHTML = quality;

    const { options } = this.player.config.quality;
    const qualityButtons = options.map(
      (option: string, index: number) => {
        const onClick = () => this.changeQuality(option);

        return (
          <button
            key={index}
            data-plyr='quality'
            type='button'
            role='menuitemradio'
            className='plyr__control plyr__tab-focus'
            aria-checked={option === quality}
            value={option}
            onClick={onClick}>
            <span>{option}</span>
          </button>
        );
      });
    ReactDOM.render(qualityButtons, this.qualityMenu);
  }

  changeQuality(quality: string) {
    this.startProgress = this.progress;
    this.startFullScreen = this.state.isFullScreen;
    this.clean();
    this.setState({ quality });
  }

  onReady = (player: any) => {
    this.player = player;
    this.player.muted = !!this.props.muted;
    this.addQuality();

    if (this.startFullScreen) {
      this.player.elements.buttons.fullscreen.click();
      this.startFullScreen = false;
    }

    const { duration, marks } = this.props;

    if (!marks) {
      return;
    }

    const setMarks = () => {
      const videoDuration = duration || player.duration;

      if (!videoDuration) {
        return;
      }

      this.addMarks(videoDuration);
      this.clean();
    };

    if (duration) {
      setMarks();
    } else {
      this.marksInterval = setInterval(setMarks, 10);
    }
  }

  updateVideoPosition = () => {
    const player = this.player.elements.wrapper;

    if (this.state.isFullScreen) {
      player.style.height = '';
      player.style.top = '';
      return;
    }

    const { width: containerWidth, height: containerHeight } =
      player.parentElement.getBoundingClientRect();
    const [videoWidth, videoHeight] = this.videoRatio;
    const targetHeight = containerWidth * videoHeight / videoWidth;
    const targetOffsetTop = (containerHeight - targetHeight) / 2;

    player.style.height = `${targetHeight}px`;
    player.style.top = `${targetOffsetTop}px`;
    player.style.transform = '';
  }

  onResize = () => this.updateVideoPosition();

  onProgress = (time: number) => {
    this.progress = time;

    if (!this.videoRatio && this.player.embed) {
      this.videoRatio = this.player.embed.ratio;
      this.updateVideoPosition();
      window.addEventListener('resize', this.onResize);
    }

    if (time && time < this.startProgress) {
      this.player.currentTime = this.startProgress;
      this.startProgress = 0;
    }

    if (this.props.onProgress) {
      this.props.onProgress(time);
    }
  }

  onEnd = () => {
    this.setState({
      isStarted: false,
      isFullScreen: false,
    });

    const { onEnd } = this.props;

    if (onEnd) {
      onEnd();
    }
  }

  onFullscreen(on: boolean) {
    this.setState({ isFullScreen: on });

    if (this.props.muted) {
      this.player.muted = !on;
    }

    this.updateVideoPosition();
  }

  clean() {
    if (this.marksInterval) {
      clearInterval(this.marksInterval);
    }
  }

  setFullScreen = () => (this.ref.current as any).enterFullscreen();

  play = () => {
    (this.ref.current as any).play();
    this.player.muted = false;
  }

  componentDidUpdate(prevProps: Readonly<IVideoProps>, prevState: Readonly<IVideoState>) {
    this.clean();

    if (this.props.url !== prevProps.url) {
      this.startProgress = 0;
    }
  }

  componentWillUnmount() {
    this.clean();
    window.removeEventListener('resize', this.onResize);
  }

  render() {
    const { autoPlay, url, playButtonSize, preview } = this.props;
    const { quality, isFullScreen, isStarted, isPlaying } = this.state;
    const qualityParam = quality === 'Auto' ? '' : `&quality=${quality}`;
    const isVimeo = url && url.indexOf('vimeo') >= 0 || /^\d+?\?/.test(url);
    const videoUrl = isVimeo ? `${url}${qualityParam}&controls=0&fakeAttr=fake` : url;

    const options: any = {
      className: 'react-player',
      url: isVimeo ? null : videoUrl,
      autoplay: true,
      type: isVimeo ? 'vimeo' : 'video',
      playing: this.state.isStarted,
      invertTime: false,
    };

    const vimeoOptions = {
      videoId: videoUrl,
      onReady: this.onReady,
      onTimeUpdate: this.onProgress,
      onEnd: this.onEnd,
      onEnterFullscreen: () => this.onFullscreen(true),
      onExitFullscreen: () => this.onFullscreen(false),
      onPause: () => this.setState({ isPlaying: false }),
      onPlay: () => this.setState({ isPlaying: true }),
      quality: {
        options: ['Auto', '1080p', '720p', '540p', '360p', '240p'],
      },
      // controls: [
      //   'play',
      //   'progress',
      //   'current-time',
      //   'duration',
      //   'rewind',
      //   'fast-forward',
      //   'mute',
      //   'volume',
      //   'pip',
      //   'settings',
      //   'fullscreen',
      // ],
      seekTime: 5,
      tooltips: {
        controls: true,
      },
      i18n: {
        play: 'Воспроизведение',
        pause: 'Пауза',
        fastForward: 'Вперед на {seektime} сек',
        rewind: 'Назад на {seektime} сек',
        seekLabel: '{currentTime} из {duration}',
        played: 'Проигрывание',
        duration: 'Продолжительность',
        volume: 'Громкость',
        enableCaptions: 'Включить субтитры',
        disableCaptions: 'Выключить субтитры',
        enterFullscreen: 'На весь экран',
        exitFullscreen: 'Выйти из полного экрана',
        captions: 'Субтитры',
        mute: 'Выкл. звук',
        unmute: 'Вкл. звук',
        settings: 'Настройки',
        speed: 'Скорость',
        normal: 'Обычная',
        quality: 'Качество',
        start: 'Старт',
        end: 'Конец',
      },
    };

    const buttonClass = cn('video__button', {
      'video__button--small': playButtonSize === 'small',
    });
    const player = isVimeo
      ? <Player {...options} {...(isVimeo ? vimeoOptions : {})} ref={this.ref} />
      : (
        <iframe
          src={`${url}?autoplay=1`}
          allow='autoplay'
          allowFullScreen
          width='100%'
          height='100%'
          frameBorder='0' />
      );
    const showButtonAfterStart = autoPlay && !isFullScreen;

    return (
      <div className={cn('video', { 'video--fullscreen': isFullScreen })}>
        {isStarted ? (
          <>
            <div className='video__player-wrapper' key={videoUrl}>
              {isClient && url && player}
            </div>
            {showButtonAfterStart && (
              <div className={buttonClass} onClick={autoPlay ? this.setFullScreen : this.play}>
                <Icons.play />
              </div>
            )}
          </>
        ) : (
          <>
            {!!preview && <img className='video__preview' src={preview} alt='' />}
            <div className={buttonClass} onClick={this.start}>
              <Icons.play />
            </div>
          </>
        )}
      </div>
    );
  }
}

export default Video;
