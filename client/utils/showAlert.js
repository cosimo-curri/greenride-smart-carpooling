import { SPSheet } from "@sekizlipenguen/react-native-popup-confirm-toast";
import CustomBottomSheet from "../components/CustomBottomSheet";

export function showAlert(type, title, message, handle, globalAssets, navigation) {
    const typesNotClosable = ["BottomSheetSignUp", "BottomSheetDepartureType"];

    const closable = typesNotClosable.includes(type) ? false : true;

    SPSheet.show({
        component: () => <CustomBottomSheet type={ type } title={ title } message={ message } handle={ handle } globalAssets={ globalAssets } navigation={ navigation }/>,
        height: null,
        keyboardHeightAdjustment: true,
        dragTopOnly: true, //FIXED, PLEASE DON'T CHANGE
        closeOnPressMask: closable,
        closeOnPressBack: closable,
        closeOnDragDown: closable
    });
}