import React from 'react';
import cn from 'classnames';
import withClickOutside from 'react-click-outside';

import Icons from '../icons';
import { Input } from '../Input';
import {
  ValidationComponent,
  IValidationProps,
  IValidationState,
} from '../Validation';

interface ISelectItem {
  key: string;
  text: string;
}

interface ISelectProps extends IValidationProps {
  className?: string;
  emptyItemText?: string;
  items: ISelectItem[];
  multi?: boolean;
  ref?: (input: any) => void;
  onChange?: (value: string | string[], name?: string) => void;
  value?: string | string[];
}

interface ISelectState extends IValidationState {
  isOpen: boolean;
  items: JSX.Element[];
  value: string[];
}

class Select extends ValidationComponent<ISelectProps, ISelectState> {
  height: number;
  selectedText: string;

  constructor(props: ISelectProps) {
    super(props);

    this.state = this.getState(props);
  }

  getState(props: ISelectProps): ISelectState {
    const {
      emptyItemText,
      required,
      items: itemsFromProps,
      value: valueFromProps,
    } = props;
    const items = [
      ...(required ? [] : [{ key: '', text: emptyItemText }]),
      ...itemsFromProps,
    ];
    const value = valueFromProps
      ? Array.isArray(valueFromProps)
        ? [...valueFromProps]
        : [valueFromProps]
      : [];

    return {
      ...this.state,
      items: this.renderItems(items, value),
      value,
      isOpen: false,
    };
  }

  handleClickOutside() {
    this.toggle();
  }

  toggle() {
    this.setState({ isOpen: false } as ISelectState);
  }

  componentDidUpdate(
    prevProps: Readonly<ISelectProps>,
    prevState: Readonly<ISelectState>,
  ): void {
    super.componentDidUpdate(prevProps, prevState);
    const { items, value } = this.props;
    const { items: prevItems, value: prevValue } = prevProps;

    if (prevItems.length !== items.length || prevValue !== value) {
      this.setState(this.getState(this.props));
    }
  }

  selectKey = (key: string) => {
    const { items, multi, onChange, name } = this.props;
    const { value } = this.state;
    const newValue = multi
      ? value.includes(key)
        ? value.filter((item: string) => item !== key)
        : [...value, key]
      : [key];

    this.setState({
      items: this.renderItems(items, newValue),
      isOpen: !!multi,
      value: newValue,
    } as ISelectState);

    onChange && onChange(newValue, name);
  };

  renderItems = (items: ISelectItem[], value: string[]) => {
    const selectedTexts: string[] = [];
    const renderedItems = items.map((item: ISelectItem) => {
      const isSelected = value.indexOf(item.key) >= 0;

      if (isSelected) {
        selectedTexts.push(item.text);
      }

      return (
        <li
          key={`${name}_${item.key}`}
          className={cn('select__item', {
            ['select__item--selected']: isSelected,
          })}
          value={item.key}
          onClick={() => this.selectKey(item.key)}
        >
          {item.text}
        </li>
      );
    });

    this.selectedText = selectedTexts.join(', ');

    return renderedItems;
  };

  toggleItems = () =>
    this.setState({ isOpen: !this.state.isOpen } as ISelectState);

  render() {
    const { className } = this.props;
    const { items, isOpen, value } = this.state;

    return (
      <div className={cn('select', className, { ['select_opened']: isOpen })}>
        <Input
          {...this.props}
          autocomplete='off'
          isSelect
          onClick={this.toggleItems}
          value={value.join(', ')}
        />
        <div className='select__text'>{this.selectedText}</div>
        <ul className='select__items'>{items}</ul>
        <span
          className={cn('select__triangle', {
            'select__triangle--opened': isOpen,
          })}
        >
          <Icons.triangle />
        </span>
      </div>
    );
  }
}

export default withClickOutside(Select);
