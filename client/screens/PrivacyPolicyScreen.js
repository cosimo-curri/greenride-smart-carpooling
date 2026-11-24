import { StyleSheet, View, ScrollView } from "react-native";
import { useAssetsContext } from "../contexts/AssetsContext";

import Colors from "../theme/colors";

import Header from "../components/Header";
import ScreenTitle from "../components/ScreenTitle";
import NestedList from "../components/NestedList";

function PrivacyPolicyScreen({ navigation }) {
    const { globalAssets } = useAssetsContext();

    const listData = [
        {
            type: "ordered",
            text: "Purpose of Processing",
            children: [
                {
                    type: "unordered",
                    text: "Management of the corporate carpooling service"
                },
                {
                    type: "unordered",
                    text: "Display of available routes"
                },
                {
                    type: "unordered",
                    text: "Sending notifications related to ride bookings"
                },
                {
                    type: "unordered",
                    text: "Anonymous statistical analysis to improve the service"
                }
            ]
        },
        {
            type: "ordered",
            text: "Legal Basis",
            children: [
                {
                    type: "unordered",
                    text: "Consent of the data subject (Art. 6.1.a GDPR)"
                },
                {
                    type: "unordered",
                    text: "Legitimate interest (Art. 6.1.f GDPR)"
                }
            ]
        },
        {
            type: "ordered",
            text: "Data Collected",
            children: [
                {
                    type: "unordered",
                    text: "Number of seats available in the vehicle"
                },
                {
                    type: "unordered",
                    text: "Position of the starting point of a ride offer"
                },
                {
                    type: "unordered",
                    text: "Company duly registered with GreenRide for which the user works"
                },
                {
                    type: "unordered",
                    text: "Position-to-work route (approximate)"
                },
                {
                    type: "unordered",
                    text: "Availability to offer or request rides"
                },
                {
                    type: "unordered",
                    text: "Technical browsing data"
                }
            ]
        },
        {
            type: "ordered",
            text: "Data Recipients",
            children: [
                {
                    type: "unordered",
                    text: "Other users from the same company (in a limited form)"
                },
                {
                    type: "unordered",
                    text: "The company, only in aggregate and anonymous form"
                }
            ]
        },
        {
            type: "ordered",
            text: "Retention Period",
            children: [
                {
                    type: "unordered",
                    text: "Until account deactivation or a maximum of 12 months of inactivity"
                }
            ]
        },
        {
            type: "ordered",
            text: "Subject Rights",
            children: [
                {
                    type: "unordered",
                    text: "Access, rectification, erasure, objection, portability (Arts. 15–21 GDPR)"
                },
                {
                    type: "unordered",
                    text: "Withdrawal of consent at any time"
                },
                {
                    type: "unordered",
                    text: "Right to lodge a complaint with the Data Protection Authority"
                }
            ]
        },
        {
            type: "ordered",
            text: "Important Notes",
            children: [
                {
                    type: "unordered",
                    text: "Participation is voluntary"
                },
                {
                    type: "unordered",
                    text: "The company cannot monitor individual use of the service"
                },
                {
                    type: "unordered",
                    text: "The platform does not share employees’ personal data with the company"
                }
            ]
        }
    ];

    return (
        <View style={ styles.container }>
            <Header
                logo={ globalAssets.logo.localUri }
                stories={ false }
                hamburgerData={[
                    {
                        text: "Back it up",
                        handle: () => navigation.goBack()
                    }
                ]}
            />

            <ScreenTitle
                title="Privacy Policy"
                imageUri={ globalAssets.shield.localUri }
                text="Last updated 17/06/2025 by GreenRide"
                up={ true }
                backgroundColor={ Colors.backgroundGreenColor }
                titleColor={ Colors.secondary }
                textColor={ Colors.black }
            />

            <ScrollView style={ styles.scrollContainer }>
                <View style={ styles.nestedListBox }>
                    <NestedList items={ listData } />
                </View>

                <ScreenTitle
                    title="Questions About our Policies?"
                    text="If you have any questions about our Privacy Policy, please don't hesitate to contact us at "
                    up={ false }
                    backgroundColor={ Colors.secondary }
                    titleColor={ Colors.white }
                    textColor={ Colors.textColorInSecondary }
                    hypertextEnd={ process.env.EXPO_PUBLIC_CONTACT_EMAIL || "contact@example.com" }
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center"
    },
    scrollContainer: {
        width: "100%"
    },
    nestedListBox: {
        padding: 20
    }
});

export default PrivacyPolicyScreen;