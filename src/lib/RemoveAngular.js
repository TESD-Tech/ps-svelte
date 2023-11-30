/**
 * @function removeAngularAttributes
 * @description Removes Angular attributes from the specified DOM element and its descendants.
 * @param {string} selector - The CSS selector for the target element.
 */

let removeAngularAttributes = (selector) => {
  // Find the target element using the provided selector
  const element = document.querySelector(selector);

  // Return if the element is not found
  if (!element) return;

  /**
   * Helper function to check if an attribute is an Angular attribute.
   * @param {Attr} attr - The attribute to check.
   * @returns {boolean} True if the attribute is an Angular attribute, false otherwise.
   */
  const isAngularAttribute = (attr) => /^data-ng-|^ng-|^x-ng-/.test(attr.name);

  /**
   * Helper function to remove Angular attributes from a given element.
   * @param {Element} el - The element from which to remove Angular attributes.
   */
  const removeAttributes = (el) => {
    // Iterate through the attributes and remove Angular attributes
    Array.from(el.attributes).forEach((attribute) => {
      if (isAngularAttribute(attribute)) {
        el.removeAttribute(attribute.name);
      }
    });
  };

  /**
   * Recursive function to traverse the DOM and remove Angular attributes.
   * @param {Element} el - The current element in the traversal.
   */
  const traverseAndRemove = (el) => {
    // Remove Angular attributes from the current element
    removeAttributes(el);

    // Recursively traverse and remove Angular attributes from child elements
    Array.from(el.children).forEach((child) => {
      traverseAndRemove(child);
    });
  };

  // Initiate the traversal and removal process
  traverseAndRemove(element);
};

// Example usage:
removeAngularAttributes("#addEditOfficeVisit");
