import * as React from 'react';
import * as dayjs from 'dayjs';
import cn from 'classnames';
import { ValidationComponent, IValidationProps, IValidationState } from 'components/Validation';
import { getMonthName, formatNumWithLeadZero } from '../../helpers';

const date = dayjs();

export const currentDateTime = {
  year: date.year(),
  month: date.month() + 1,
  day: date.date(),
  hour: date.hour() % 24,
  minute: date.minute() % 60,
};


const CLASS = 'datetime';
const ANIMATION_TIME_SEC = .5;
const MINUTE_STEP = 5;
const HOUR_MIN_TODAY = (currentDateTime.hour + 2) % 24;

type TDateTimeProps = IValidationProps & {
  fromToday?: boolean;
  withAnimation?: boolean;
  withTime?: boolean;
};

type TDateTimeState = IValidationState & {
  animationDate: 'left' | 'right' | '';
  animationTime: 'up' | 'down' | '';
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  prevYear: number;
  prevMonth: number;
  prevHour: number,
  prevMinute: number,
  value: string;
};

export default class DateTime extends ValidationComponent<TDateTimeProps, TDateTimeState> {
  timeoutId: NodeJS.Timeout = null;
  renderedDate: React.ReactElement = null;
  renderedDatePrev: React.ReactElement = null;
  renderedDays: React.ReactElement = null;
  renderedDaysPrev: React.ReactElement = null;
  ref = React.createRef<HTMLDivElement>();

  constructor(props: TDateTimeProps) {
    super(props);

    const { month, year, day } = currentDateTime;

    this.state = {
      ...this.state,
      ...currentDateTime,
      animationDate: '',
      animationTime: '',
      hour: HOUR_MIN_TODAY,
      minute: 0,
      prevMonth: month,
      prevYear: year,
      prevHour: HOUR_MIN_TODAY,
      prevMinute: 0,
    };
    this.renderedDate = this.renderDate(year, month, day);
    this.renderedDays = this.renderDays(year, month, day);
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  onChange = () => {
    const { year, month, day, hour, minute } = this.state;
    const { name, onFocus } = this.props;
    const value = date
      .year(year).month(month - 1).date(day).hour(hour).minute(minute).toISOString();

    this.onChangeValue(value);

    if (onFocus) {
      onFocus(name, this.ref.current);
    }
  }

  onSelectDay = (day: number) => this.updateDate(this.state.year, this.state.month, day);

  yearUp = () => this.updateDate(this.state.year + 1);
  yearDown = () => this.updateDate(this.state.year - 1);
  monthUp = () => this.updateDate(this.state.year, this.state.month + 1);
  monthDown = () => this.updateDate(this.state.year, this.state.month - 1);

  hourDown = () => this.updateTime(this.state.hour - 1);
  hourUp = () => this.updateTime(this.state.hour + 1);
  minuteDown = () => this.updateTime(this.state.hour, this.state.minute - MINUTE_STEP);
  minuteUp = () => this.updateTime(this.state.hour, this.state.minute + MINUTE_STEP);

  updateDate(year: number, month: number = this.state.month, day = this.state.day) {
    const { prevMonth, prevYear } = this.state;
    const { withAnimation } = this.props;
    let { hour } = this.state;

    if (month < 1) {
      month = 12;
      year--;
    }

    if (month > 12) {
      month = 1;
      year++;
    }

    if (year === currentDateTime.year && month < currentDateTime.month) {
      month = currentDateTime.month;
    }

    const selectedMonth = date.year(year).month(month - 1).date(1);

    day = Math.min(day, selectedMonth.daysInMonth());

    const isToday = year === currentDateTime.year
      && month === currentDateTime.month
      && day === currentDateTime.day;

    if (isToday && hour < HOUR_MIN_TODAY) {
      hour = HOUR_MIN_TODAY;
    }

    this.renderedDate = this.renderDate(year, month, day);
    this.renderedDays = this.renderDays(year, month, day);

    const needChangePage = withAnimation && (prevMonth !== month || prevYear !== year);

    if (needChangePage) {
      const isLeft = year > prevYear || (month > prevMonth && year === prevYear);

      this.renderedDatePrev = this.renderDate(prevYear, prevMonth, day);
      this.renderedDaysPrev = this.renderDays(prevYear, prevMonth, day);

      this.setState({ animationDate: isLeft ? 'left' : 'right' });

      this.timeoutId = setTimeout(
        () => this.setState({
          animationDate: '',
          prevMonth: month,
          prevYear: year,
        }),
        ANIMATION_TIME_SEC * 1000,
        );
    }

    this.setState({ hour, day, month, year }, this.onChange);
  }

  updateTime(hour: number, minute = this.state.minute) {
    const { prevHour, prevMinute } = this.state;
    const { withAnimation } = this.props;

    if (hour < 0) {
      hour = 23;
    }

    if (hour > 23) {
      hour = 0;
    }

    if (minute < 0) {
      minute = 60 - MINUTE_STEP;
    }

    if (minute > 60 - MINUTE_STEP) {
      minute = 0;
    }

    if (withAnimation) {
      const isUp = hour > prevHour || minute > prevMinute;

      this.setState({ animationTime: isUp ? 'up' : 'down' });

      this.timeoutId = setTimeout(
        () => this.setState({
          animationTime: '',
          prevHour: hour,
          prevMinute: minute,
        }),
        ANIMATION_TIME_SEC * 1000,
      );
    }

    this.setState({ hour, minute }, this.onChange);
  }

  renderDays(year: number, month: number, day: number) {
    const { fromToday } = this.props;
    const targetDate = date.year(year).month(month - 1).date(1);
    const weekDaysBefore = (targetDate.day() || 7) - 1;
    const isCurrentMonth = currentDateTime.year === year && currentDateTime.month === month;
    const daysClass = `${CLASS}__days`;
    const itemClass = `${daysClass}-item`;
    const isPastLocked = fromToday && isCurrentMonth;

    const days = [...Array(weekDaysBefore)].map(() => null)
      .concat([...Array(targetDate.daysInMonth())].map((x, index) => index + 1));

    days.push(...[...Array(42 - days.length)].map(() => null));

    return (
      <ul className={`${CLASS}__days`}>
        {days.map((value, index) => {
          const isToday = isCurrentMonth && value === currentDateTime.day;
          const isLocked = !value || (isPastLocked && value < currentDateTime.day);
          const isSelected = day && value === day;

          return (
            <li
              className={cn(itemClass, {
                [`${itemClass}--selected`]: isSelected,
                [`${itemClass}--today`]: isToday,
                [`${CLASS}__locked`]: isLocked,
              })}
              key={index}
              onClick={value && !isLocked ? () => this.onSelectDay(value) : null}>
              {value}
            </li>
          );
        })}
      </ul>
    );
  }

  renderDate(year: number, month: number, day: number) {
    const { fromToday, label } = this.props;
    const canYearDown = !fromToday || year > currentDateTime.year;
    const canMonthDown = !fromToday || canYearDown || (month > currentDateTime.month);

    return (
      <div className={`${CLASS}__date`}>
        {label && <label>{label}</label>}
        <div className={`${CLASS}__day`}>{day}</div>
        <div className={`${CLASS}__month`}>
          <div
            className={cn(`${CLASS}__left`, {
              [`${CLASS}__locked`]: !canMonthDown,
            })}
            onClick={canMonthDown ? this.monthDown : null}
          />
          {getMonthName(month, 2)}
          <div className={`${CLASS}__right`} onClick={this.monthUp} />
        </div>
        <div className={`${CLASS}__year`}>
          <div
            className={cn(`${CLASS}__left`, {
              [`${CLASS}__locked`]: !canYearDown,
            })}
            onClick={canYearDown ? this.yearDown : null}
          />
          {year}
          <div className={`${CLASS}__right`} onClick={this.yearUp} />
        </div>
      </div>
    );
  }

  renderTime() {
    const { fromToday } = this.props;
    const { year, month, day, hour, minute, prevHour, prevMinute, animationTime } = this.state;
    const isToday = year === currentDateTime.year
      && month === currentDateTime.month
      && day === currentDateTime.day;
    const canHourDown = !fromToday || !isToday || hour > HOUR_MIN_TODAY;
    const canHourUp = !fromToday || !isToday || hour < 23;
    const classTime = `${CLASS}__time`;
    const isHourChanged = prevHour !== hour;
    const isMinuteChanged = prevMinute !== minute;

    return (
      <div className={cn(classTime, {
        [`${CLASS}__time--animation-${animationTime}`]: animationTime,
      })} ref={this.ref}>
        <div className={`${CLASS}__hour`}>
          <div
            className={cn(`${CLASS}__up`, {
              [`${CLASS}__locked`]: !canHourUp,
            })}
            onClick={canHourUp ? this.hourUp : null}
          />
          <span className={cn({ [`${classTime}-next`]: isHourChanged })}>
            {formatNumWithLeadZero(hour)}
          </span>
          {animationTime && isHourChanged && (
            <span className={`${classTime}-prev`}>
            {formatNumWithLeadZero(prevHour)}
          </span>
          )}
          <div
            className={cn(`${CLASS}__down`, {
              [`${CLASS}__locked`]: !canHourDown,
            })}
            onClick={canHourDown ? this.hourDown : null}
          />
        </div>
        :
        <div className={`${CLASS}__minute`}>
          <div
            className={`${CLASS}__up`}
            onClick={this.minuteUp}
          />
            <span className={cn({ [`${classTime}-next`]: isMinuteChanged })}>
              {formatNumWithLeadZero(minute)}
            </span>
            {animationTime && isMinuteChanged && (
              <span className={`${classTime}-prev`}>
              {formatNumWithLeadZero(prevMinute)}
            </span>
            )}
          <div
            className={`${CLASS}__down`}
            onClick={this.minuteDown}
          />
        </div>
      </div>
    );
  }

  render() {
    const { animationDate } = this.state;
    const { withTime } = this.props;
    const { renderedDate, renderedDatePrev, renderedDays, renderedDaysPrev } = this;

    return (
      <fieldset className={CLASS}>
        <div className={cn(`${CLASS}__calendar`, {
          [`${CLASS}__calendar--animation-${animationDate}`]: animationDate,
        })}>
          {animationDate === 'left' ? renderedDatePrev : renderedDate}
          {animationDate === 'right' ? renderedDaysPrev : renderedDays}
          {animationDate && (
            <div className={`${CLASS}__calendar-prev`}>
              {animationDate === 'right' ? renderedDatePrev : renderedDate}
              {animationDate === 'left' ? renderedDaysPrev : renderedDays}
            </div>
          )}
          {withTime && this.renderTime()}
        </div>
      </fieldset>
    );
  }
}
