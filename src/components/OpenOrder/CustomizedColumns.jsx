import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Checkbox from '@mui/material/Checkbox';
import './OpenOrder.css'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openOrderCustomColumnsSelector } from '../../store/account/selector';
import { useEffect } from 'react';
import { customizedColumnOpenOrderRequest } from '../../store/account/actions';
import { useRef } from 'react';

const CustomizeColumns = () => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const CustomColumnsState = useSelector(openOrderCustomColumnsSelector);
    const dispatch = useDispatch();
    const prevOpen = useRef(open);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    const handleListKeyDown= (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);

    const columnCheckedHandler = (e, key) => {
        dispatch(customizedColumnOpenOrderRequest({
            key,
            value: e.target.checked
        }));
    }
    return (
        <div className='customized-open-order-main'>
            <Button
                ref={anchorRef}
                id="composition-button"
                aria-controls={open ? 'composition-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                onMouseEnter={handleToggle}
            >
                <i className="far fa-cog icon_customize"></i>
                <i className="fas fa-sort-down icon_customize_1"></i>

            </Button>
            <Popper className={`main-custom-open-order`} 
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="bottom-start"
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom-start' ? 'left top' : 'left bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList
                                    autoFocusItem={open}
                                    id="composition-menu"
                                    aria-labelledby="composition-button"
                                    onKeyDown={handleListKeyDown}
                                >
                                    <div className='span_customize'>Customize the Columns</div>
                                    {
                                        Object.keys(CustomColumnsState).map((item, index) => {
                                            return (
                                                <MenuItem className="checkbox-menu-item-open-order">
                                                    <Checkbox key={index}  className={`${CustomColumnsState[item] ? 'check_customize-active' : 'check_customize' }  `} checked={CustomColumnsState[item]} onClick={(e) => columnCheckedHandler(e, item)} /><span className={`${CustomColumnsState[item] ? 'customized-open-order-span-text-active' : 'customized-open-order-span-text'}`}>{item}</span>
                                                </MenuItem>
                                            )
                                        })
                                    }


                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </div>

    );
}
export default CustomizeColumns;