import flatpickr from 'flatpickr';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import { useEffect, useRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/plugins/monthSelect/style.css';

type PickerType = 'date' | 'month' | 'time';

type FlatpickrInputProps = Omit<
    ComponentPropsWithoutRef<'input'>,
    'onChange' | 'type' | 'value'
> & {
    pickerType: PickerType;
    value: string;
    onChange: (value: string) => void;
};

export function FlatpickrInput({
    pickerType,
    value,
    onChange,
    ...inputProps
}: FlatpickrInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<flatpickr.Instance | null>(null);
    const onChangeRef = useRef(onChange);
    const placeholder = {
        date: 'YYYY-MM-DD',
        month: 'YYYY-MM',
        time: 'HH:MM',
    }[pickerType];

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!inputRef.current) return;

        const dateFormat = {
            date: 'Y-m-d',
            month: 'Y-m',
            time: 'H:i',
        }[pickerType];

        const picker = flatpickr(inputRef.current, {
            allowInput: true,
            dateFormat,
            defaultDate: value || undefined,
            enableTime: pickerType === 'time',
            noCalendar: pickerType === 'time',
            time_24hr: true,
            plugins:
                pickerType === 'month'
                    ? [
                          monthSelectPlugin({
                              dateFormat: 'Y-m',
                              altFormat: 'F Y',
                          }),
                      ]
                    : [],
            onChange: (_selectedDates, dateString) => {
                onChangeRef.current(dateString);
            },
        });

        pickerRef.current = picker;

        return () => {
            picker.destroy();
            pickerRef.current = null;
        };
    }, [pickerType]);

    useEffect(() => {
        const picker = pickerRef.current;
        if (!picker || picker.input.value === value) return;

        if (value) {
            picker.setDate(value, false);
        } else {
            picker.clear(false);
        }
    }, [value]);

    return (
        <input
            {...inputProps}
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            placeholder={inputProps.placeholder ?? placeholder}
            autoComplete="off"
        />
    );
}
