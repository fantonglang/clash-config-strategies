#!/bin/bash

# List all network interfaces
interfaces=$(ifconfig -a | grep '^[a-z]' | awk '{print $1}')

# Loop through each interface
for iface in $interfaces; do
  # Remove trailing colon if it exists
  iface=${iface%:}

  # Skip the loopback interface
  if [ "$iface" == "lo0" ]; then
    continue
  fi

  # Check if the interface exists
  if ifconfig $iface > /dev/null 2>&1; then
    # Check if the interface is up
    ifconfig $iface | grep -q 'status: active'
    if [ $? -ne 0 ]; then
      # Check if the interface has an IP address
      ip_address=$(ifconfig $iface | grep 'inet ' | awk '{print $2}')
      if [ -n "$ip_address" ]; then
        # Bring down and delete the interface if it has an IP address
        echo "Cleaning up unused interface: $iface with IP address: $ip_address"
        sudo ifconfig $iface down
        sudo ifconfig $iface delete
      else
        # Bring down the interface if it has no IP address
        echo "Cleaning up unused interface: $iface with no IP address"
        sudo ifconfig $iface down
      fi
    else
      echo "Interface $iface is active, skipping."
    fi
  else
    echo "Interface $iface does not exist, skipping."
  fi
done