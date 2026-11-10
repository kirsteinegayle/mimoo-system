import 'package:flutter/material.dart';

import '../../mock/rider_mock.dart';
import 'delivery_job_detail.dart';
import 'pickup_job_detail.dart';

/// Opens the right detail screen for a MOCK job.
void openJobDetail(BuildContext context, MockJob job) {
  if (job.isPickup) {
    Navigator.of(context).push(MaterialPageRoute<void>(
        builder: (_) => PickupJobDetailScreen(job: job)));
    return;
  }
  Navigator.of(context).push(MaterialPageRoute<void>(
      builder: (_) => DeliveryJobDetailScreen(job: job)));
}
