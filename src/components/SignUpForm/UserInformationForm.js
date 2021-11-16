import React, { useState, useEffect, useContext } from 'react'
import { key, ChainValidation } from 'meta1js'
import AccountApi from '../../lib/AccountApi'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import './SignUpForm.css'

import {
    Button,
    Form,
    Grid,
    Input,
    Popup
} from 'semantic-ui-react'

const useDebounce = (value, timeout) => {
    const [state, setState] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => setState(value), timeout)

        return () => clearTimeout(handler)
    }, [value, timeout])

    return state
}

const UserInformationForm = (props) => {
    const [generatedPassword, setGeneratedPassword] = useState('')
    useEffect(() => {
        if (generatedPassword === '') {
            setGeneratedPassword(`P${key.get_random_key().toWif().toString()}`)
        }
    }, [generatedPassword])

    const [accountName, setAccountName] = useState(props.accountName || '')
    const debouncedAccountName = useDebounce(accountName, 100)
    const [accountNameErrors, setAccountNameErrors] = useState(null)
    const [email, setEmail] = useState(props.email || '')
    const [firstName, setFirstName] = useState(props.firstName || '')
    const [lastName, setLastName] = useState(props.lastName || '')
    const [phone, setPhone] = useState(props.phone || '')
    const [password, setPassword] = useState('')
    const [searchAccount, setSearchAccount] = useState([['PM', '']])
    const [accountError, setAccountError] = useState(null)
    useEffect(() => {
        if (accountName) {
            AccountApi.lookupAccounts(accountName, 1)
                .then((res) => setSearchAccount(res))
                .catch((err) => console.log(err))

            if (accountName.includes('.') || accountName.includes('-')) {
                setAccountError(null)
            } else {
                setAccountError('Account Should Contains Chars like ( ., -,)')
            }
        }
    }, [accountName])

    useEffect(() => {
        const error =
            ChainValidation.is_account_name_error(debouncedAccountName)
        if (error) {
            setAccountNameErrors({
                content: error,
                pointing: 'below'
            })
        } else {
            setAccountNameErrors(null)
        }
    }, [debouncedAccountName])

    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        if (isSubmitted) {
            props.onSubmit(
                accountName,
                generatedPassword,
                email,
                phone,
                lastName,
                firstName
            )
        }
        return () => setIsSubmitted(false)
    }, [
        isSubmitted,
        accountName,
        generatedPassword,
        props,
        email,
        lastName,
        phone
    ])

    const { innerWidth: width } = window
    const isMobile = width <= 600
    return (
        <>
        <h2 className="head-title">Create META Wallet</h2>
        <Grid>
            <Grid.Column width={16} className="singup-grid">
                <Form autoComplete="off" onSubmit={setIsSubmitted}>
                    <div className="field">
                        <Grid stackable>
                            <Grid.Column width={isMobile ? 16 : 8}>
                                <Form.Field>
                                    <label>First Name</label>
                                    <input
                                        value={firstName}
                                        onChange={(event) =>
                                            setFirstName(event.target.value)
                                        }
                                        placeholder="First Name"
                                        // required
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Email</label>
                                    <input
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        value={email}
                                        type="email"
                                        placeholder="Email"
                                        required
                                    />
                                </Form.Field>
                            </Grid.Column>

                            <Grid.Column width={isMobile ? 16 : 8}>
                                <Form.Field>
                                    <label>Last Name</label>
                                    <input
                                        value={lastName}
                                        onChange={(event) => {
                                            setLastName(event.target.value)
                                        }}
                                        placeholder="Last Name"
                                        // required
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Phone Number</label>
                                    <input
                                        value={phone}
                                        onChange={(event) =>
                                            setPhone(event.target.value)
                                        }
                                        title="+1-234-567-8900"
                                        placeholder="Phone Number"
                                        pattern="+[0-9]{2}-[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                        type="tel"
                                        required
                                    />
                                </Form.Field>
                            </Grid.Column>
                        </Grid>
                    </div>

                    <Form.Field>
                        <label>Account Name</label>
                        <input
                            control={Input}
                            value={accountName}
                            type="text"
                            error={accountNameErrors}
                            placeholder="Account Name"
                            onChange={(event) => {
                                setAccountName(
                                    event.target.value.toLocaleLowerCase()
                                    )
                            }}
                        />
                        {accountError && ( <p style={{ color: 'red' }}> {accountError}</p> )}
                    </Form.Field>

                    <Form.Field>
                        <label>Password test</label>
                        <div className="ui action input">
                            <input
                                value={generatedPassword}
                                type="text"
                                disabled
                                />
                                <CopyToClipboard
                                text={generatedPassword}
                                onCopy={() => {}}
                            >
                                <div name="copyToken" className="ui yellow right icon button brown">
                                    <i className="fal fa-copy"/>
                                </div>
                            </CopyToClipboard>
                        </div>
                    </Form.Field>
                    
                    <Form.Field>
                        <label>Password Confirmation</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />
                    </Form.Field>
                    {searchAccount[0][0] === accountName && (
                        <p style={{ color: 'red' }}>
                        Account is already used{' '}
                        </p>
                    )}
                    <Form.Field>
                        <Button

                            // onClick={() => setIsSubmitted(true)}
                            className="yellow"
                            style={{color: '#240000'}}
                            type="submit"
                            disabled={
                                firstName === '' ||
                                lastName === '' ||
                                email === '' ||
                                accountNameErrors !== null ||
                                password !== generatedPassword ||
                                searchAccount[0][0] === accountName
                            }
                            className={
                                firstName === '' ||
                                lastName === '' ||
                                email === '' ||
                                accountNameErrors !== null ||
                                searchAccount[0][0] === accountName ||
                                password !== generatedPassword
                                ? 'btnSendDisabled ui button yellow'
                                : 'btnSend ui button yellow'
                            }
                        >
                            Submit
                        </Button>
                    </Form.Field>
                </Form>
            </Grid.Column>
        </Grid>
        </>
    )
}

export { UserInformationForm }
