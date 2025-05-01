import { useState, useCallback } from "react";
import { Messages } from "@/components/sidebar/pages/PagesProvider.tsx";

function useMessageOptions(messages: Messages[]) {
  // State to keep track of the ID of the message currently being hovered or touched.
  // null means no message is currently active for options.
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);

  // Handler for mouse entering a message element (desktop hover)
  const handleMouseEnter = useCallback((messageId: number) => {
    setActiveMessageId(messageId);
  }, []);

  // Handler for mouse leaving a message element (desktop hover)
  const handleMouseLeave = useCallback(() => {
    // We add a small delay here before setting to null.
    // This helps prevent the options from disappearing immediately
    // if the user's mouse briefly leaves the message element while
    // trying to interact with the options menu itself.
    // You might need to adjust the delay based on your UI and menu implementation.
    console.log("leave");
    const leaveTimer = setTimeout(() => {
      setActiveMessageId(null);
    }, 1000); // 50ms delay

    // You might need a way to clear this timeout if a new message is hovered
    // very quickly. For simplicity in this basic hook, we don't handle that,
    // but in a more complex scenario, you might store timer IDs in a ref
    // and clear them on new hovers.
  }, []);

  // Handler for touch starting on a message element (mobile touch)
  const handleTouchStart = useCallback((messageId: number) => {
    // On touch start, we toggle the active state for that message.
    // If it's already active, we deactivate it. If not, we activate it.
    // This allows a tap to open/close the options on mobile.
    setActiveMessageId((prevId) => (prevId === messageId ? null : messageId));
  }, []);

  // You might want to add a global touch listener to close any open menu
  // if the user touches outside of the message or the menu itself.
  // This is more complex and depends on your menu implementation, so
  // it's not included in this basic hook, but is something to consider
  // for a good mobile user experience.

  return {
    activeMessageId,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    // You might also want to return a helper function to check if a specific
    // message is active:
    isMessageActive: useCallback(
      (messageId: number | null) => activeMessageId === messageId,
      [activeMessageId],
    ),
  };
}

export default useMessageOptions;
