export interface Breadcrumb {
  /**
   * Label of the breadcrumb.
   */
  label: string;

  /**
   * Icon of the breadcrumb.
   */
  icon?: string;

  /**
   * Url to the breadcrumb (if not loading), if not using RouterLink.
   */
  url?: string;

  /**
   * Url segments to the breadcrumb (if not loading), useful for RouterLink.
   */
  urlSegments?: any[];

  /**
   * True if the breadcrumb is being loaded.
   */
  loading?: boolean;
}
