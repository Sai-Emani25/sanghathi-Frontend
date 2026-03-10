import Settings from "./Settings";

export default function FacultySettings(props) {
  // You can customize this component for faculty-specific settings
  return <Settings {...props} userType="faculty" />;
}
